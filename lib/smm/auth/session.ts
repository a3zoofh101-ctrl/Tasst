import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/smm/db/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken
} from "@/lib/smm/auth/jwt";
import type { Role } from "@prisma/client";

export async function createSession(userId: string, role: Role) {
  const hdrs = await headers();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
      userAgent: hdrs.get("user-agent")?.slice(0, 255),
      ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null
    }
  });

  const token = await signSessionToken({ sub: userId, sid: session.id, role });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const claims = await verifySessionToken(token);
    if (claims) {
      await prisma.session.update({
        where: { id: claims.sid },
        data: { revoked: true }
      }).catch(() => undefined);
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export type CurrentSession = {
  userId: string;
  role: Role;
  sessionId: string;
};

export async function getSession(): Promise<CurrentSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const dbSession = await prisma.session.findUnique({ where: { id: claims.sid } });
  if (!dbSession || dbSession.revoked || dbSession.expiresAt < new Date()) {
    return null;
  }

  return { userId: claims.sub, role: claims.role, sessionId: claims.sid };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { wallet: true }
  });

  if (!user || !user.isActive) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
