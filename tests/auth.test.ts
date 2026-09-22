import { describe, it, expect, beforeAll } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/smm/auth/password";
import { signSessionToken, verifySessionToken } from "@/lib/smm/auth/jwt";
import { prisma } from "@/lib/smm/db/prisma";
import { createTestUser } from "./helpers/fixtures";

beforeAll(() => {
  process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? "test-auth-secret-at-least-32-characters-long";
});

describe("password hashing", () => {
  it("verifies a correct password and rejects an incorrect one", async () => {
    const hash = await hashPassword("Password123!");
    expect(await verifyPassword("Password123!", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword!", hash)).toBe(false);
  });

  it("salts the hash so two hashes of the same password differ", async () => {
    const [h1, h2] = await Promise.all([hashPassword("Password123!"), hashPassword("Password123!")]);
    expect(h1).not.toBe(h2);
  });
});

describe("registration uniqueness", () => {
  it("rejects a second account with the same email", async () => {
    const user = await createTestUser();
    await expect(
      prisma.user.create({
        data: { name: "آخر", email: user.email, passwordHash: await hashPassword("Whatever123!") }
      })
    ).rejects.toThrow();
  });
});

describe("session JWT (building block for middleware RBAC)", () => {
  it("round-trips subject/session-id/role through sign + verify", async () => {
    const token = await signSessionToken({ sub: "user-1", sid: "session-1", role: "ADMIN" });
    const claims = await verifySessionToken(token);
    expect(claims).toMatchObject({ sub: "user-1", sid: "session-1", role: "ADMIN" });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({ sub: "user-1", sid: "session-1", role: "USER" });
    const tampered = token.slice(0, -2) + (token.slice(-2) === "aa" ? "bb" : "aa");
    expect(await verifySessionToken(tampered)).toBeNull();
  });
});
