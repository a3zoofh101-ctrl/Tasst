"use server";

import { randomBytes, createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/smm/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/smm/auth/password";
import { createSession, destroySession, requireUser, getSession } from "@/lib/smm/auth/session";
import { logAudit } from "@/lib/smm/audit";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from "@/lib/smm/validation/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "هذا البريد الإلكتروني مستخدم بالفعل" };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      wallet: { create: { balance: 0 } }
    }
  });

  await logAudit({ actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id });
  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-shape error to avoid leaking whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  if (!user.isActive) {
    return { ok: false, error: "تم تعطيل هذا الحساب. تواصل مع الدعم الفني." };
  }

  await createSession(user.id, user.role);
  await logAudit({ actorId: user.id, action: "USER_LOGIN", entityType: "User", entityId: user.id });
  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export async function forgotPasswordAction(
  formData: FormData
): Promise<ActionResult & { devResetLink?: string }> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بريد إلكتروني غير صالح" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always report success to avoid leaking whether an email is registered.
  const generic: ActionResult = { ok: true };
  if (!user) return generic;

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    }
  });

  await logAudit({ actorId: user.id, action: "PASSWORD_RESET_REQUESTED", entityType: "User", entityId: user.id });

  // No email provider is configured yet (see README). In development we
  // surface the reset link directly so the flow is testable end-to-end;
  // in production this must be replaced with a real transactional email send.
  if (process.env.NODE_ENV !== "production") {
    return { ...generic, devResetLink: `/reset-password?token=${rawToken}` };
  }

  return generic;
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية" };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.updateMany({ where: { userId: record.userId }, data: { revoked: true } })
  ]);

  await logAudit({ actorId: record.userId, action: "PASSWORD_RESET_COMPLETED", entityType: "User", entityId: record.userId });

  return { ok: true };
}

// Self-service password change for a logged-in user (any role). Revokes
// every other session so a compromised device is logged out immediately.
export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword")
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "كلمة المرور الحالية غير صحيحة" };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  const session = await getSession();

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.session.updateMany({
      where: { userId: user.id, id: { not: session?.sessionId }, revoked: false },
      data: { revoked: true }
    })
  ]);

  await logAudit({ actorId: user.id, action: "PASSWORD_CHANGED", entityType: "User", entityId: user.id });

  return { ok: true };
}
