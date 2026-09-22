"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { logAudit } from "@/lib/smm/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(60),
  supportEmail: z.string().trim().email(),
  minDepositAmount: z.coerce.number().min(1),
  maxDepositAmount: z.coerce.number().min(1)
});

export async function updateSettingsAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    supportEmail: formData.get("supportEmail"),
    minDepositAmount: formData.get("minDepositAmount"),
    maxDepositAmount: formData.get("maxDepositAmount")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  await prisma.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, create: { key, value }, update: { value } })
    )
  );

  await logAudit({ actorId: admin.id, action: "SETTINGS_UPDATED", entityType: "Setting" });
  revalidatePath("/admin/settings");
  return { ok: true };
}
