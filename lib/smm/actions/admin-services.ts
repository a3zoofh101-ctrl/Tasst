"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { calcSellingPrice } from "@/lib/smm/money";
import { logAudit } from "@/lib/smm/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

const importSchema = z.object({
  providerServiceId: z.string().min(1),
  platformId: z.string().min(1),
  categoryId: z.string().min(1),
  name: z.string().trim().min(2).max(150),
  markupType: z.enum(["PERCENT", "FIXED"]),
  markupValue: z.coerce.number().min(0)
});

export async function importProviderServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = importSchema.safeParse({
    providerServiceId: formData.get("providerServiceId"),
    platformId: formData.get("platformId"),
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    markupType: formData.get("markupType"),
    markupValue: formData.get("markupValue")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  const ps = await prisma.providerService.findUnique({ where: { id: parsed.data.providerServiceId } });
  if (!ps) return { ok: false, error: "خدمة المزود غير موجودة" };

  const existing = await prisma.service.findUnique({ where: { providerServiceId: ps.id } });
  if (existing) return { ok: false, error: "تم استيراد هذه الخدمة بالفعل" };

  const pricePer1000 = calcSellingPrice(ps.providerRate, parsed.data.markupType, parsed.data.markupValue);

  await prisma.$transaction([
    prisma.service.create({
      data: {
        providerServiceId: ps.id,
        providerId: ps.providerId,
        providerRefId: ps.providerServiceId,
        platformId: parsed.data.platformId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        providerCost: ps.providerRate,
        markupType: parsed.data.markupType,
        markupValue: parsed.data.markupValue,
        pricePer1000: pricePer1000.toFixed(2),
        minQuantity: ps.minQuantity,
        maxQuantity: ps.maxQuantity,
        active: false
      }
    }),
    prisma.providerService.update({ where: { id: ps.id }, data: { imported: true } })
  ]);

  await logAudit({ actorId: admin.id, action: "SERVICE_IMPORTED", entityType: "ProviderService", entityId: ps.id });
  revalidatePath("/admin/services");
  return { ok: true };
}

const updateSchema = z.object({
  serviceId: z.string().min(1),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  markupType: z.enum(["PERCENT", "FIXED"]),
  markupValue: z.coerce.number().min(0),
  minQuantity: z.coerce.number().int().positive(),
  maxQuantity: z.coerce.number().int().positive(),
  refill: z.coerce.boolean(),
  cancelSupported: z.coerce.boolean(),
  averageTime: z.string().trim().max(60).optional().or(z.literal(""))
});

export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse({
    serviceId: formData.get("serviceId"),
    name: formData.get("name"),
    description: formData.get("description"),
    markupType: formData.get("markupType"),
    markupValue: formData.get("markupValue"),
    minQuantity: formData.get("minQuantity"),
    maxQuantity: formData.get("maxQuantity"),
    refill: formData.get("refill") === "on",
    cancelSupported: formData.get("cancelSupported") === "on",
    averageTime: formData.get("averageTime")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  if (parsed.data.minQuantity > parsed.data.maxQuantity) {
    return { ok: false, error: "الحد الأدنى يجب ألا يتجاوز الحد الأعلى" };
  }

  const service = await prisma.service.findUnique({ where: { id: parsed.data.serviceId } });
  if (!service) return { ok: false, error: "الخدمة غير موجودة" };

  const pricePer1000 = calcSellingPrice(service.providerCost, parsed.data.markupType, parsed.data.markupValue);

  await prisma.service.update({
    where: { id: service.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      markupType: parsed.data.markupType,
      markupValue: parsed.data.markupValue,
      pricePer1000: pricePer1000.toFixed(2),
      minQuantity: parsed.data.minQuantity,
      maxQuantity: parsed.data.maxQuantity,
      refill: parsed.data.refill,
      cancelSupported: parsed.data.cancelSupported,
      averageTime: parsed.data.averageTime || null
    }
  });

  await logAudit({ actorId: admin.id, action: "SERVICE_UPDATED", entityType: "Service", entityId: service.id });
  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function toggleServiceActiveAction(serviceId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { ok: false, error: "الخدمة غير موجودة" };

  await prisma.service.update({ where: { id: serviceId }, data: { active: !service.active } });
  await logAudit({ actorId: admin.id, action: service.active ? "SERVICE_DISABLED" : "SERVICE_ENABLED", entityType: "Service", entityId: serviceId });
  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  return { ok: true };
}
