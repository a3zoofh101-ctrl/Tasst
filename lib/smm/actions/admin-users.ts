"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { getOrCreateWallet, creditWallet, debitWallet } from "@/lib/smm/wallet";
import { InsufficientBalanceError } from "@/lib/smm/wallet";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

const adjustSchema = z.object({
  userId: z.string().min(1),
  amount: z.coerce.number().positive("أدخل مبلغًا صحيحًا"),
  reason: z.string().trim().min(3, "أدخل سبب العملية").max(300)
});

export async function adminAdjustBalanceAction(
  formData: FormData,
  direction: "CREDIT" | "DEBIT"
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = adjustSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    reason: formData.get("reason")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  const wallet = await getOrCreateWallet(parsed.data.userId);
  const amount = new Decimal(parsed.data.amount);

  try {
    if (direction === "CREDIT") {
      await creditWallet({ walletId: wallet.id, type: "ADMIN_CREDIT", amount, reference: admin.id, description: parsed.data.reason });
      await notifyUser({ userId: parsed.data.userId, type: "WALLET_CREDITED", title: "تم إضافة رصيد من الإدارة", body: parsed.data.reason, link: "/dashboard/wallet" });
    } else {
      await debitWallet({ walletId: wallet.id, type: "ADMIN_DEBIT", amount, reference: admin.id, description: parsed.data.reason });
    }
  } catch (err) {
    if (err instanceof InsufficientBalanceError) return { ok: false, error: err.message };
    throw err;
  }

  await logAudit({
    actorId: admin.id,
    action: direction === "CREDIT" ? "ADMIN_WALLET_CREDIT" : "ADMIN_WALLET_DEBIT",
    entityType: "User",
    entityId: parsed.data.userId,
    metadata: { amount: amount.toFixed(2), reason: parsed.data.reason }
  });

  revalidatePath(`/admin/users/${parsed.data.userId}`);
  revalidatePath("/admin/transactions");
  return { ok: true };
}

export async function adminToggleUserActiveAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "المستخدم غير موجود" };
  if (user.role === "ADMIN") return { ok: false, error: "لا يمكن تعطيل حساب مدير" };

  const updated = await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  await logAudit({
    actorId: admin.id,
    action: updated.isActive ? "USER_ENABLED" : "USER_DISABLED",
    entityType: "User",
    entityId: userId
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}
