"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { encryptSecret } from "@/lib/smm/auth/encryption";
import { getProviderAdapter } from "@/lib/smm/providers/factory";
import { ProviderApiError } from "@/lib/smm/providers/types";
import { logAudit } from "@/lib/smm/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

const createProviderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.enum(["MOCK", "GENERIC"]),
  apiUrl: z.string().trim().url("رابط API غير صالح").optional().or(z.literal("")),
  apiKey: z.string().trim().optional().or(z.literal(""))
});

export async function createProviderAction(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = createProviderSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    apiUrl: formData.get("apiUrl"),
    apiKey: formData.get("apiKey")
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  if (parsed.data.type === "GENERIC" && (!parsed.data.apiUrl || !parsed.data.apiKey)) {
    return { ok: false, error: "رابط API ومفتاحه مطلوبان لمزوّد من النوع Generic" };
  }

  const provider = await prisma.provider.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      apiUrl: parsed.data.apiUrl || null,
      apiKeyEncrypted: parsed.data.apiKey ? encryptSecret(parsed.data.apiKey) : null
    }
  });

  await logAudit({ actorId: admin.id, action: "PROVIDER_CREATED", entityType: "Provider", entityId: provider.id });
  revalidatePath("/admin/providers");
  return { ok: true };
}

export async function toggleProviderActiveAction(providerId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return { ok: false, error: "المزود غير موجود" };

  await prisma.provider.update({ where: { id: providerId }, data: { active: !provider.active } });
  await logAudit({ actorId: admin.id, action: provider.active ? "PROVIDER_DISABLED" : "PROVIDER_ENABLED", entityType: "Provider", entityId: providerId });
  revalidatePath("/admin/providers");
  return { ok: true };
}

export async function refreshProviderBalanceAction(providerId: string): Promise<ActionResult> {
  await requireAdmin();
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return { ok: false, error: "المزود غير موجود" };

  try {
    const adapter = getProviderAdapter(provider);
    const balance = await adapter.getBalance();
    await prisma.provider.update({ where: { id: providerId }, data: { balance } });
    revalidatePath("/admin/providers");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ProviderApiError ? err.message : "تعذّر جلب رصيد المزود" };
  }
}

export async function syncProviderServicesAction(providerId: string): Promise<ActionResult & { count?: number }> {
  const admin = await requireAdmin();
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) return { ok: false, error: "المزود غير موجود" };

  try {
    const adapter = getProviderAdapter(provider);
    const services = await adapter.getServices();

    await prisma.$transaction(
      services.map((s) =>
        prisma.providerService.upsert({
          where: { providerId_providerServiceId: { providerId, providerServiceId: s.providerServiceId } },
          create: {
            providerId,
            providerServiceId: s.providerServiceId,
            providerName: s.name,
            providerCategory: s.category,
            providerRate: s.rate,
            minQuantity: s.minQuantity,
            maxQuantity: s.maxQuantity,
            raw: s.raw ? JSON.parse(JSON.stringify(s.raw)) : undefined
          },
          update: {
            providerName: s.name,
            providerCategory: s.category,
            providerRate: s.rate,
            minQuantity: s.minQuantity,
            maxQuantity: s.maxQuantity,
            syncedAt: new Date(),
            raw: s.raw ? JSON.parse(JSON.stringify(s.raw)) : undefined
          }
        })
      )
    );

    await logAudit({ actorId: admin.id, action: "PROVIDER_SERVICES_SYNCED", entityType: "Provider", entityId: providerId, metadata: { count: services.length } });
    revalidatePath("/admin/services");
    revalidatePath("/admin/providers");
    return { ok: true, count: services.length };
  } catch (err) {
    return { ok: false, error: err instanceof ProviderApiError ? err.message : "تعذّرت مزامنة الخدمات" };
  }
}
