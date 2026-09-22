"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { logAudit } from "@/lib/smm/audit";
import { reclassifyServicePlatforms, restoreServicePlatforms, type ReclassifyResult, type ReclassifySnapshotEntry } from "@/lib/smm/catalog-import";

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
//
// The full per-service snapshot (previous platformId/categoryId) is kept
// in the audit log, not sent back to the browser — a large catalog's
// snapshot can run into the thousands of rows, and the client only needs
// the summary counts for its toast. rollbackLastReclassifyAction reads it
// back out to undo the move.
export async function reclassifyPlatformsAction(): Promise<ActionResult & Partial<Omit<ReclassifyResult, "snapshot">>> {
  const admin = await requireAdmin();

  const { snapshot, ...summary } = await reclassifyServicePlatforms(prisma);

  await logAudit({
    actorId: admin.id,
    action: "SERVICES_RECLASSIFIED",
    entityType: "Service",
    entityId: "bulk",
    metadata: { ...summary, snapshot }
  });

  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/smm");

  return { ok: true, ...summary };
}

// Undoes the most recent reclassifyPlatformsAction run, restoring every
// moved service to its previous platform/category from the audit-log
// snapshot. Only the latest run can be undone, and only once — this is a
// safety net for a reclassify that produced unexpected groupings, not a
// general multi-step undo history.
export async function rollbackLastReclassifyAction(): Promise<ActionResult & { restored?: number }> {
  const admin = await requireAdmin();

  const last = await prisma.auditLog.findFirst({
    where: { action: { in: ["SERVICES_RECLASSIFIED", "SERVICES_RECLASSIFY_ROLLED_BACK"] } },
    orderBy: { createdAt: "desc" }
  });
  if (!last || last.action !== "SERVICES_RECLASSIFIED") {
    return { ok: false, error: "لا يوجد إعادة تصنيف حديثة للتراجع عنها" };
  }

  const snapshot = (last.metadata as { snapshot?: ReclassifySnapshotEntry[] } | null)?.snapshot ?? [];
  if (snapshot.length === 0) {
    return { ok: false, error: "لا توجد خدمات تم نقلها في آخر عملية تصنيف" };
  }

  const { restored } = await restoreServicePlatforms(prisma, snapshot);

  await logAudit({
    actorId: admin.id,
    action: "SERVICES_RECLASSIFY_ROLLED_BACK",
    entityType: "AuditLog",
    entityId: last.id,
    metadata: { restored }
  });

  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/smm");

  return { ok: true, restored };
}
