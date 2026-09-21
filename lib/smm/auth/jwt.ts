import { SignJWT, jwtVerify } from "jose";

export type SessionClaims = {
  sub: string; // userId
  sid: string; // session id (DB-backed, revocable)
  role: "USER" | "ADMIN";
};

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({ role: claims.role, sid: claims.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (!payload.sub || !payload.sid || !payload.role) return null;
    return {
      sub: payload.sub as string,
      sid: payload.sid as string,
      role: payload.role as "USER" | "ADMIN"
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "tasst_session";
export { SESSION_MAX_AGE_SECONDS };
