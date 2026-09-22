// Bulk-applies a flat PERCENT markup over provider cost to many Service
// rows at once — for a catalog imported at 0% markup (selling at exact
// cost, no profit) that needs a real margin applied after the fact.
import type { PrismaClient } from "@prisma/client";
import { calcSellingPrice } from "@/lib/smm/money";

export type MarkupSnapshotEntry = { serviceId: string; markupType: "PERCENT" | "FIXED"; markupValue: string; pricePer1000: string };
export type MarkupPageResult = { updated: number; scanned: number; nextCursor: string | null; snapshot: MarkupSnapshotEntry[] };

const DEFAULT_PAGE_SIZE = 200;

/**
 * Applies `markupPercent` (PERCENT markup over providerCost) to one
 * id-cursor page of services. Unlike reclassifyServicePlatformsPage, each
 * service's new pricePer1000 is individually computed from its own
 * providerCost, so rows in a page can't be grouped into one shared
 * updateMany — they're applied as one batched $transaction of per-row
 * updates instead, still a single DB round trip per page.
 *
 * Bounded to one page per call for the same reason as the reclassify
 * pagination: a full-catalog single call risks exceeding a serverless
 * function's duration limit on a large (~5,000-row) catalog.
 *
 * Returns each updated service's PREVIOUS (markupType, markupValue,
 * pricePer1000) as `snapshot`, so the caller can accumulate it across
 * pages and persist the full run for a one-click rollback.
 */
export async function applyBulkMarkupPage(
  prisma: PrismaClient,
  opts: { cursor?: string | null; pageSize?: number; markupPercent: number; onlyZeroMargin: boolean }
): Promise<MarkupPageResult> {
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const services = await prisma.service.findMany({
    where: {
      ...(opts.cursor ? { id: { gt: opts.cursor } } : {}),
      ...(opts.onlyZeroMargin ? { markupValue: 0 } : {})
    },
    orderBy: { id: "asc" },
    take: pageSize,
    select: { id: true, providerCost: true, markupType: true, markupValue: true, pricePer1000: true }
  });
  if (services.length === 0) return { updated: 0, scanned: 0, nextCursor: null, snapshot: [] };

  const snapshot: MarkupSnapshotEntry[] = [];
  const updates = [];
  for (const s of services) {
    const newPrice = calcSellingPrice(s.providerCost, "PERCENT", opts.markupPercent);
    const unchanged = s.markupType === "PERCENT" && s.markupValue.toNumber() === opts.markupPercent && s.pricePer1000.equals(newPrice);
    if (unchanged) continue;

    snapshot.push({ serviceId: s.id, markupType: s.markupType, markupValue: s.markupValue.toFixed(2), pricePer1000: s.pricePer1000.toFixed(2) });
    updates.push(
      prisma.service.update({
        where: { id: s.id },
        data: { markupType: "PERCENT", markupValue: opts.markupPercent, pricePer1000: newPrice.toFixed(2) }
      })
    );
  }
  if (updates.length > 0) await prisma.$transaction(updates);

  const nextCursor = services.length === pageSize ? services[services.length - 1].id : null;
  return { updated: snapshot.length, scanned: services.length, nextCursor, snapshot };
}

/**
 * Restores every service in `snapshot` to the (markupType, markupValue,
 * pricePer1000) it had before an applyBulkMarkupPage() run — the undo
 * half of the bulk markup action. Applied in batched transactions of
 * CHUNK rows for the same reason as the forward pass.
 */
export async function restoreBulkMarkup(prisma: PrismaClient, snapshot: MarkupSnapshotEntry[]): Promise<{ restored: number }> {
  const CHUNK = 200;
  for (let i = 0; i < snapshot.length; i += CHUNK) {
    const batch = snapshot.slice(i, i + CHUNK);
    await prisma.$transaction(
      batch.map((e) =>
        prisma.service.update({
          where: { id: e.serviceId },
          data: { markupType: e.markupType, markupValue: e.markupValue, pricePer1000: e.pricePer1000 }
        })
      )
    );
  }
  return { restored: snapshot.length };
}
