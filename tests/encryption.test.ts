import { describe, it, expect, beforeAll } from "vitest";
import { encryptSecret, decryptSecret } from "@/lib/smm/auth/encryption";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "0".repeat(64);
});

describe("provider API key encryption", () => {
  it("round-trips a secret value", () => {
    const encrypted = encryptSecret("super-secret-provider-key");
    expect(encrypted).not.toContain("super-secret-provider-key");
    expect(decryptSecret(encrypted)).toBe("super-secret-provider-key");
  });

  it("rejects a tampered ciphertext instead of silently returning garbage", () => {
    const encrypted = encryptSecret("super-secret-provider-key");
    const [iv, tag, data] = encrypted.split(".");
    const tampered = [iv, tag, data.slice(0, -2) + (data.slice(-2) === "aa" ? "bb" : "aa")].join(".");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
