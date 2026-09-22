// Shared by both prisma/seed.ts (plain Node/tsx — no Next.js runtime, no
// "server-only") and the admin "import all services" action, so a real
// provider's catalog can be bulk-imported from either a local seed run or
// a single click in the admin UI (the latter needs no terminal at all —
// works from a phone browser).
import type { PrismaClient, Prisma } from "@prisma/client";
import { calcSellingPrice } from "@/lib/smm/money";
import type { ProviderServiceDto } from "@/lib/smm/providers/types";

// Maps a provider's free-text category/service name to one of our existing
// platform slugs where possible (so real services land in the same
// platform tab as the seeded/mock ones), or a new platform on the fly.
// Real provider catalogs are almost always Arabic-labeled ("سناب شات"، not
// "snapchat"), so every platform needs its Arabic spelling(s) too — English
// keywords alone left virtually everything falling through to "أخرى".
const PLATFORM_KEYWORDS: { slug: string; name: string; keywords: string[] }[] = [
  { slug: "instagram", name: "إنستغرام", keywords: ["instagram", "insta", "انستقرام", "انستغرام", "إنستقرام", "إنستغرام", "انستجرام", "انستا"] },
  { slug: "tiktok", name: "تيك توك", keywords: ["tiktok", "tik tok", "تيك توك", "تيكتوك"] },
  { slug: "youtube", name: "يوتيوب", keywords: ["youtube", "يوتيوب", "يوتيو"] },
  { slug: "x-twitter", name: "X (تويتر)", keywords: ["twitter", "x/twitter", " x ", "تويتر", "اكس", "إكس"] },
  { slug: "snapchat", name: "سناب شات", keywords: ["snapchat", "snap", "سناب شات", "سناب", "سنابشات"] },
  { slug: "telegram", name: "تيليجرام", keywords: ["telegram", "تيليجرام", "تليجرام", "تليغرام"] },
  { slug: "facebook", name: "فيسبوك", keywords: ["facebook", " fb ", "فيسبوك", "فيس بوك", "فيس"] },
  { slug: "linkedin", name: "لينكدإن", keywords: ["linkedin", "لينكدإن", "لينكد ان", "لينكدين"] },
  { slug: "spotify", name: "سبوتيفاي", keywords: ["spotify", "سبوتيفاي", "سبوتيفاى"] },
  { slug: "twitch", name: "تويتش", keywords: ["twitch", "تويتش"] },
  { slug: "discord", name: "ديسكورد", keywords: ["discord", "ديسكورد"] },
  { slug: "pinterest", name: "بينترست", keywords: ["pinterest", "بينترست", "بينتيرست"] },
  { slug: "threads", name: "ثريدز", keywords: ["threads", "ثريدز"] },
  { slug: "whatsapp", name: "واتساب", keywords: ["whatsapp", "واتساب", "واتس اب", "واتس"] },
  { slug: "reddit", name: "ريديت", keywords: ["reddit", "ريديت"] },
  { slug: "soundcloud", name: "ساوند كلاود", keywords: ["soundcloud", "ساوند كلاود", "ساوندكلاود"] }
];

export function detectPlatform(text: string): { slug: string; name: string } {
  const lower = ` ${text.toLowerCase()} `;
  for (const p of PLATFORM_KEYWORDS) {
    if (p.keywords.some((k) => lower.includes(k))) return p;
  }
  return { slug: "other", name: "أخرى" };
}

// A canonical category taxonomy shared across every platform, instead of
// trusting the provider's own (often inconsistent, sometimes just
// Arabic-only) category label. Ordered most-specific-first: "live" is
// checked before the generic metric keywords so e.g. "لايكات بث مباشر"
// (live-stream likes) lands under "live", not "likes".
const CATEGORY_KEYWORDS: { slug: string; name: string; keywords: string[] }[] = [
  { slug: "live", name: "بث مباشر", keywords: ["live stream", "livestream", "live view", "بث مباشر", "لايف"] },
  { slug: "story-views", name: "مشاهدات ستوري", keywords: ["story view", "story views", "مشاهدات ستوري", "مشاهدات القصة", "مشاهدات قصص"] },
  { slug: "poll-votes", name: "تصويت استطلاعات", keywords: ["poll vote", "poll votes", "تصويت", "استطلاع"] },
  { slug: "reach-impressions", name: "الوصول والانطباعات", keywords: ["impression", "impressions", "reach", "انطباع", "انطباعات", "وصول"] },
  { slug: "profile-visits", name: "زيارات الملف الشخصي", keywords: ["profile visit", "زيارات الملف", "زيارة الملف", "زوار الملف"] },
  { slug: "connections", name: "اتصالات", keywords: ["connections", "connection", "اتصالات"] },
  { slug: "listeners", name: "مستمعين", keywords: ["listeners", "listener", "مستمع", "مستمعين"] },
  { slug: "plays", name: "تشغيلات", keywords: ["plays", "play count", "stream count", "تشغيل", "تشغيلات", "استماع"] },
  { slug: "saves", name: "حفظ", keywords: ["save", "saves", "bookmark", "bookmarks", "حفظ", "محفوظات"] },
  { slug: "reposts", name: "ريتويت / إعادة نشر", keywords: ["retweet", "retweets", "repost", "reposts", "ريتويت", "اعادة نشر", "إعادة نشر"] },
  { slug: "shares", name: "مشاركات", keywords: ["shares", "share", "مشاركة", "مشاركات"] },
  { slug: "comments", name: "تعليقات", keywords: ["comments", "comment", "reply", "replies", "تعليق", "تعليقات", "رد", "ردود"] },
  { slug: "subscribers", name: "مشتركين", keywords: ["subscribers", "subscriber", "مشترك", "مشتركين", "اشتراك", "اشتراكات"] },
  { slug: "members", name: "أعضاء", keywords: ["members", "member", "عضو", "أعضاء", "اعضاء"] },
  { slug: "followers", name: "متابعين", keywords: ["followers", "follower", "متابع", "متابعين"] },
  { slug: "likes", name: "لايكات", keywords: ["likes", "like", "لايك", "لايكات"] },
  { slug: "views", name: "مشاهدات", keywords: ["views", "view", "مشاهدات", "مشاهدة"] },
  { slug: "engagement", name: "تفاعل", keywords: ["engagement", "تفاعل"] }
];

export function detectCategory(text: string): { slug: string; name: string } {
  const lower = ` ${text.toLowerCase()} `;
  for (const c of CATEGORY_KEYWORDS) {
    if (c.keywords.some((k) => lower.includes(k))) return c;
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
    const text = `${s.category ?? ""} ${s.name}`;
    const detected = detectPlatform(text);
    const category = detectCategory(text);
    return { service: s, platformSlug: detected.slug, platformName: detected.name, categorySlug: category.slug, categoryName: category.name };
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

export type ReclassifySnapshotEntry = { serviceId: string; platformId: string; categoryId: string };
export type ReclassifyResult = { moved: number; total: number; snapshot: ReclassifySnapshotEntry[] };

/**
 * Re-runs detectPlatform against every already-imported Service (using its
 * name + the provider's original category text) and moves it to the
 * platform/category that now matches — for catalogs imported before
 * detectPlatform knew Arabic keywords, which all landed under "أخرى".
 * Grouped into one updateMany per (platform, category) pair rather than a
 * per-service update, so this stays a handful of queries regardless of
 * how many thousand services need moving.
 *
 * Returns each moved service's PREVIOUS (platformId, categoryId) as
 * `snapshot`, so the caller can persist it (e.g. in an audit log) and
 * offer a real one-click rollback rather than just recommending an
 * external DB backup.
 */
export async function reclassifyServicePlatforms(prisma: PrismaClient): Promise<ReclassifyResult> {
  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      platformId: true,
      categoryId: true,
      providerService: { select: { providerCategory: true } }
    }
  });
  if (services.length === 0) return { moved: 0, total: 0, snapshot: [] };

  const resolved = services.map((s) => {
    const text = `${s.providerService?.providerCategory ?? ""} ${s.name} ${s.description ?? ""}`;
    const detected = detectPlatform(text);
    const category = detectCategory(text);
    return { service: s, platformSlug: detected.slug, platformName: detected.name, categorySlug: category.slug, categoryName: category.name };
  });

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

  const groups = new Map<string, { platformId: string; categoryId: string; ids: string[] }>();
  const snapshot: ReclassifySnapshotEntry[] = [];
  for (const r of resolved) {
    const platform = platformBySlug.get(r.platformSlug)!;
    const category = categoryByKey.get(`${platform.id}:${r.categorySlug}`)!;
    if (r.service.platformId === platform.id && r.service.categoryId === category.id) continue;
    // Capture the PREVIOUS location before it's overwritten below, so a
    // rollback can restore it exactly.
    snapshot.push({ serviceId: r.service.id, platformId: r.service.platformId, categoryId: r.service.categoryId });
    const key = `${platform.id}:${category.id}`;
    let group = groups.get(key);
    if (!group) {
      group = { platformId: platform.id, categoryId: category.id, ids: [] };
      groups.set(key, group);
    }
    group.ids.push(r.service.id);
  }

  for (const group of groups.values()) {
    for (const batch of chunk(group.ids, CHUNK_SIZE)) {
      await prisma.service.updateMany({
        where: { id: { in: batch } },
        data: { platformId: group.platformId, categoryId: group.categoryId }
      });
    }
  }

  return { moved: snapshot.length, total: services.length, snapshot };
}

/**
 * Restores every service in `snapshot` to the (platformId, categoryId) it
 * had before a reclassifyServicePlatforms() run — the undo half of the
 * one-click reclassify action. Grouped the same way as the forward move,
 * so it stays a handful of queries regardless of catalog size.
 */
export async function restoreServicePlatforms(prisma: PrismaClient, snapshot: ReclassifySnapshotEntry[]): Promise<{ restored: number }> {
  const groups = new Map<string, { platformId: string; categoryId: string; ids: string[] }>();
  for (const entry of snapshot) {
    const key = `${entry.platformId}:${entry.categoryId}`;
    let group = groups.get(key);
    if (!group) {
      group = { platformId: entry.platformId, categoryId: entry.categoryId, ids: [] };
      groups.set(key, group);
    }
    group.ids.push(entry.serviceId);
  }

  for (const group of groups.values()) {
    for (const batch of chunk(group.ids, CHUNK_SIZE)) {
      await prisma.service.updateMany({
        where: { id: { in: batch } },
        data: { platformId: group.platformId, categoryId: group.categoryId }
      });
    }
  }

  return { restored: snapshot.length };
}
