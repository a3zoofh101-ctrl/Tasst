"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { logAudit } from "@/lib/smm/audit";
import { applyBulkMarkupPage, restoreBulkMarkup, type MarkupSnapshotEntry } from "@/lib/smm/pricing-bulk";

export type ActionResult = { ok: true } | { ok: false; error: string };

// One-page step of applying a flat markup percent across many services —
// bounded per call for the same reason as the reclassify pagination (see
// pricing-bulk.ts): a full-catalog single call risks exceeding a
// serverless function's duration limit on a large catalog.
// ApplyBulkMarkupButton drives the pagination loop client-side.
export type MarkupPageActionResult = ActionResult & { updated?: number; scanned?: number; nextCursor?: string | null; snapshot?: MarkupSnapshotEntry[] };

export async function applyBulkMarkupPageAction(cursor: string | null, markupPercent: number, onlyZeroMargin: boolean): Promise<MarkupPageActionResult> {
  await requireAdmin();
  if (!Number.isFinite(markupPercent) || markupPercent < 0 || markupPercent > 1000) {
    return { ok: false, error: "نسبة هامش الربح غير صالحة" };
  }

  const page = await applyBulkMarkupPage(prisma, { cursor, markupPercent, onlyZeroMargin });

  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/new-order");
  revalidatePath("/smm");

  return { ok: true, updated: page.updated, scanned: page.scanned, nextCursor: page.nextCursor, snapshot: page.snapshot };
}

// Persists the combined snapshot from a full (possibly multi-page) bulk
// markup run as a single audit log entry, once the client-side pagination
// loop reaches its last page — mirrors finalizeReclassifyRunAction.
export async function finalizeBulkMarkupRunAction(params: { updated: number; total: number; markupPercent: number; snapshot: MarkupSnapshotEntry[] }): Promise<ActionResult> {
  const admin = await requireAdmin();

  await logAudit({
    actorId: admin.id,
    action: "SERVICES_MARKUP_APPLIED",
    entityType: "Service",
    entityId: "bulk",
    metadata: { updated: params.updated, total: params.total, markupPercent: params.markupPercent, snapshot: params.snapshot }
  });

  return { ok: true };
}

// Undoes the most recent applyBulkMarkupPageAction run, restoring every
// updated service's previous markup/price from the audit-log snapshot.
// Only the latest run can be undone, and only once — mirrors
// rollbackLastReclassifyAction.
export async function rollbackLastMarkupRunAction(): Promise<ActionResult & { restored?: number }> {
  const admin = await requireAdmin();

  const last = await prisma.auditLog.findFirst({
    where: { action: { in: ["SERVICES_MARKUP_APPLIED", "SERVICES_MARKUP_ROLLED_BACK"] } },
    orderBy: { createdAt: "desc" }
  });
  if (!last || last.action !== "SERVICES_MARKUP_APPLIED") {
    return { ok: false, error: "لا يوجد تحديث أسعار حديث للتراجع عنه" };
  }

  const snapshot = (last.metadata as { snapshot?: MarkupSnapshotEntry[] } | null)?.snapshot ?? [];
  if (snapshot.length === 0) {
    return { ok: false, error: "لا توجد خدمات تم تحديثها في آخر عملية" };
  }

  const { restored } = await restoreBulkMarkup(prisma, snapshot);

  await logAudit({
    actorId: admin.id,
    action: "SERVICES_MARKUP_ROLLED_BACK",
    entityType: "AuditLog",
    entityId: last.id,
    metadata: { restored }
  });

  revalidatePath("/admin/services");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/new-order");
  revalidatePath("/smm");

  return { ok: true, restored };
}
