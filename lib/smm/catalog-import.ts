// Shared by both prisma/seed.ts (plain Node/tsx — no Next.js runtime, no
// "server-only") and the admin "import all services" action, so a real
// provider's catalog can be bulk-imported from either a local seed run or
// a single click in the admin UI (the latter needs no terminal at all —
// works from a phone browser).
import type { PrismaClient, Prisma } from "@prisma/client";
import { calcSellingPrice } from "@/lib/smm/money";
import type { ProviderServiceDto } from "@/lib/smm/providers/types";

export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "general";
}

// Maps a provider's free-text category/service name to one of our existing
// platform slugs where possible (so real services land in the same
// platform tab as the seeded/mock ones), or a new platform on the fly.
const PLATFORM_KEYWORDS: { slug: string; name: string; keywords: string[] }[] = [
  { slug: "instagram", name: "إنستغرام", keywords: ["instagram", "insta"] },
  { slug: "tiktok", name: "تيك توك", keywords: ["tiktok", "tik tok"] },
  { slug: "youtube", name: "يوتيوب", keywords: ["youtube"] },
  { slug: "x-twitter", name: "X (تويتر)", keywords: ["twitter", "x/twitter", " x "] },
  { slug: "snapchat", name: "سناب شات", keywords: ["snapchat", "snap"] },
  { slug: "telegram", name: "تيليجرام", keywords: ["telegram"] },
  { slug: "facebook", name: "فيسبوك", keywords: ["facebook", " fb "] },
  { slug: "linkedin", name: "لينكدإن", keywords: ["linkedin"] },
  { slug: "spotify", name: "سبوتيفاي", keywords: ["spotify"] },
  { slug: "twitch", name: "تويتش", keywords: ["twitch"] },
  { slug: "discord", name: "ديسكورد", keywords: ["discord"] },
  { slug: "pinterest", name: "بينترست", keywords: ["pinterest"] },
  { slug: "threads", name: "ثريدز", keywords: ["threads"] },
  { slug: "whatsapp", name: "واتساب", keywords: ["whatsapp"] },
  { slug: "reddit", name: "ريديت", keywords: ["reddit"] },
  { slug: "soundcloud", name: "ساوند كلاود", keywords: ["soundcloud"] }
];

export function detectPlatform(text: string): { slug: string; name: string } {
  const lower = ` ${text.toLowerCase()} `;
  for (const p of PLATFORM_KEYWORDS) {
    if (p.keywords.some((k) => lower.includes(k))) return p;
  }
  return { slug: "other", name: "أخرى" };
}

export type BulkImportResult = { imported: number; skipped: number; total: number };

const CHUNK_SIZE = 1000;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// Distinct platforms are always a handful, but distinct categories can run
// into the hundreds for a large catalog — an unbounded Promise.all there
// could exhaust the DB connection pool, so cap concurrency.
async function upsertInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (const batch of chunk(items, batchSize)) {
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
}

/**
 * Imports every service a provider's catalog returns as an active Service
 * at the given flat markup — auto-detecting/creating Platform + Category
 * rows as needed. Idempotent: safe to re-run (skips services already
 * imported).
 *
 * Runs as a handful of bulk queries (chunked at CHUNK_SIZE) instead of a
 * few round-trips per service — a provider catalog can run into the
 * thousands, and a per-service loop reliably blows past Vercel's 300s
 * function limit at that size. Refreshing an already-cached
 * ProviderService row's price/name is "مزامنة الخدمات" (syncProviderServicesAction)'s
 * job, not this one's — this only fills in Service rows that don't exist yet.
 */
export async function bulkImportProviderCatalog(params: {
  prisma: PrismaClient;
  providerId: string;
  services: ProviderServiceDto[];
  markupPercent: string | number;
}): Promise<BulkImportResult> {
  const { prisma, providerId, services, markupPercent } = params;
  if (services.length === 0) return { imported: 0, skipped: 0, total: 0 };

  const resolved = services.map((s) => {
    const detected = detectPlatform(`${s.category ?? ""} ${s.name}`);
    const categoryName = s.category?.trim() || "عام";
    return { service: s, platformSlug: detected.slug, platformName: detected.name, categoryName, categorySlug: slugify(categoryName) };
  });

  // Upsert only the distinct platforms/categories actually needed — at
  // most a few dozen round-trips, regardless of how many thousand
  // services are in the catalog.
  const distinctPlatforms = new Map<string, string>();
  for (const r of resolved) distinctPlatforms.set(r.platformSlug, r.platformName);

  let sortOrder = 100;
  const platformRows = await upsertInBatches([...distinctPlatforms.entries()], 20, ([slug, name]) =>
    prisma.platform.upsert({
      where: { slug },
      update: {},
      create: { name, slug, sortOrder: sortOrder++ }
    })
  );
  const platformBySlug = new Map(platformRows.map((p) => [p.slug, p]));

  const distinctCategories = new Map<string, { platformId: string; name: string; slug: string }>();
  for (const r of resolved) {
    const platformId = platformBySlug.get(r.platformSlug)!.id;
    const key = `${platformId}:${r.categorySlug}`;
    if (!distinctCategories.has(key)) distinctCategories.set(key, { platformId, name: r.categoryName, slug: r.categorySlug });
  }

  const categoryKeys = [...distinctCategories.keys()];
  const categoryRows = await upsertInBatches(categoryKeys, 20, (key) => {
    const c = distinctCategories.get(key)!;
    return prisma.category.upsert({
      where: { platformId_slug: { platformId: c.platformId, slug: c.slug } },
      update: {},
      create: { platformId: c.platformId, name: c.name, slug: c.slug }
    });
  });
  const categoryByKey = new Map(categoryKeys.map((key, i) => [key, categoryRows[i]]));

  // Bulk-insert the provider's raw catalog cache; rows that already exist
  // for this provider are skipped (ON CONFLICT DO NOTHING) rather than
  // refreshed — see the doc comment above.
  for (const batch of chunk(resolved, CHUNK_SIZE)) {
    await prisma.providerService.createMany({
      data: batch.map((r) => ({
        providerId,
        providerServiceId: r.service.providerServiceId,
        providerName: r.service.name,
        providerCategory: r.service.category,
        providerRate: r.service.rate,
        minQuantity: r.service.minQuantity,
        maxQuantity: r.service.maxQuantity,
        imported: true
      })),
      skipDuplicates: true
    });
  }

  // Resolve every incoming service to its (freshly inserted or
  // pre-existing) ProviderService row id in one pass of chunked lookups.
  const allRefIds = resolved.map((r) => r.service.providerServiceId);
  const providerServiceRows: { id: string; providerServiceId: string }[] = [];
  for (const batch of chunk(allRefIds, CHUNK_SIZE)) {
    const rows = await prisma.providerService.findMany({
      where: { providerId, providerServiceId: { in: batch } },
      select: { id: true, providerServiceId: true }
    });
    providerServiceRows.push(...rows);
  }
  const providerServiceIdByRef = new Map(providerServiceRows.map((r) => [r.providerServiceId, r.id]));

  const existingServiceIds = new Set<string>();
  for (const batch of chunk(providerServiceRows.map((r) => r.id), CHUNK_SIZE)) {
    const rows = await prisma.service.findMany({
      where: { providerServiceId: { in: batch } },
      select: { providerServiceId: true }
    });
    for (const row of rows) if (row.providerServiceId) existingServiceIds.add(row.providerServiceId);
  }

  let skipped = 0;
  const newServiceRows: Prisma.ServiceCreateManyInput[] = [];
  for (const r of resolved) {
    const providerServiceRowId = providerServiceIdByRef.get(r.service.providerServiceId);
    if (!providerServiceRowId) continue;
    if (existingServiceIds.has(providerServiceRowId)) {
      skipped++;
      continue;
    }
    const platform = platformBySlug.get(r.platformSlug)!;
    const category = categoryByKey.get(`${platform.id}:${r.categorySlug}`)!;
    const pricePer1000 = calcSellingPrice(r.service.rate, "PERCENT", markupPercent);
    newServiceRows.push({
      providerServiceId: providerServiceRowId,
      providerId,
      providerRefId: r.service.providerServiceId,
      platformId: platform.id,
      categoryId: category.id,
      name: r.service.name,
      providerCost: r.service.rate,
      markupType: "PERCENT",
      markupValue: markupPercent,
      pricePer1000: pricePer1000.toFixed(2),
      minQuantity: r.service.minQuantity,
      maxQuantity: r.service.maxQuantity,
      active: true,
      refill: r.service.refill ?? false,
      cancelSupported: r.service.cancelSupported ?? false,
      averageTime: r.service.averageTime
    });
  }

  for (const batch of chunk(newServiceRows, CHUNK_SIZE)) {
    await prisma.service.createMany({ data: batch, skipDuplicates: true });
  }

  return { imported: newServiceRows.length, skipped, total: services.length };
}
