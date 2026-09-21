"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { logAudit } from "@/lib/smm/audit";
import { reclassifyServicePlatforms, type ReclassifyResult } from "@/lib/smm/catalog-import";

export type ActionResult = { ok: true } | { ok: false; error: string };

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

const platformSchema = z.object({ name: z.string().trim().min(2).max(60), icon: z.string().trim().optional().or(z.literal("")) });

export async function createPlatformAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = platformSchema.safeParse({ name: formData.get("name"), icon: formData.get("icon") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  const slug = slugify(parsed.data.name);
  const exists = await prisma.platform.findUnique({ where: { slug } });
  if (exists) return { ok: false, error: "توجد منصة بنفس الاسم" };

  await prisma.platform.create({ data: { name: parsed.data.name, slug, icon: parsed.data.icon || null } });
  revalidatePath("/admin/categories");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function togglePlatformActiveAction(platformId: string): Promise<ActionResult> {
  await requireAdmin();
  const platform = await prisma.platform.findUnique({ where: { id: platformId } });
  if (!platform) return { ok: false, error: "غير موجود" };
  await prisma.platform.update({ where: { id: platformId }, data: { active: !platform.active } });
  revalidatePath("/admin/categories");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

const categorySchema = z.object({ platformId: z.string().min(1), name: z.string().trim().min(2).max(60) });

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({ platformId: formData.get("platformId"), name: formData.get("name") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };

  const slug = slugify(parsed.data.name);
  const exists = await prisma.category.findUnique({ where: { platformId_slug: { platformId: parsed.data.platformId, slug } } });
  if (exists) return { ok: false, error: "يوجد تصنيف بنفس الاسم لهذه المنصة" };

  await prisma.category.create({ data: { platformId: parsed.data.platformId, name: parsed.data.name, slug } });
  revalidatePath("/admin/categories");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function toggleCategoryActiveAction(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { ok: false, error: "غير موجود" };
  await prisma.category.update({ where: { id: categoryId }, data: { active: !category.active } });
  revalidatePath("/admin/categories");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

// One-click fix for a catalog imported before detectPlatform learned
// Arabic keywords: everything landed under "أخرى" instead of its real
// platform. Safe to re-run — a no-op once everything's already correct.
export async function reclassifyPlatformsAction(): Promise<ActionResult & Partial<ReclassifyResult>> {
  const admin = await requireAdmin();

  const result = await reclassifyServicePlatforms(prisma);

  await logAudit({
    actorId: admin.id,
    action: "SERVICES_RECLASSIFIED",
    entityType: "Service",
    entityId: "bulk",
    metadata: result
  });

  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/smm");

  return { ok: true, ...result };
}
