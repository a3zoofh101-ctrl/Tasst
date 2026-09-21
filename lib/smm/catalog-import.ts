// Shared by both prisma/seed.ts (plain Node/tsx — no Next.js runtime, no
// "server-only") and the admin "import all services" action, so a real
// provider's catalog can be bulk-imported from either a local seed run or
// a single click in the admin UI (the latter needs no terminal at all —
// works from a phone browser).
import type { PrismaClient } from "@prisma/client";
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

/**
 * Imports every service a provider's catalog returns as an active Service
 * at the given flat markup — auto-detecting/creating Platform + Category
 * rows as needed. Idempotent: safe to re-run (skips services already
 * imported, refreshes their ProviderService cache either way).
 */
export async function bulkImportProviderCatalog(params: {
  prisma: PrismaClient;
  providerId: string;
  services: ProviderServiceDto[];
  markupPercent: string | number;
  onProgress?: (done: number, total: number) => void;
  concurrency?: number;
}): Promise<BulkImportResult> {
  const { prisma, providerId, services, markupPercent, concurrency = 20 } = params;

  // Caches hold the upsert *promise*, not the resolved row, so concurrent
  // imports racing on the same new platform/category share one in-flight
  // upsert instead of firing duplicate requests before either resolves.
  const platformCache = new Map<string, Promise<{ id: string }>>();
  const categoryCache = new Map<string, Promise<{ id: string }>>();
  let platformSortOrder = 100;
  let imported = 0;
  let skipped = 0;
  let done = 0;

  function getPlatform(detected: { slug: string; name: string }) {
    let platform = platformCache.get(detected.slug);
    if (!platform) {
      platform = prisma.platform.upsert({
        where: { slug: detected.slug },
        update: {},
        create: { name: detected.name, slug: detected.slug, sortOrder: platformSortOrder++ }
      });
      platformCache.set(detected.slug, platform);
    }
    return platform;
  }

  function getCategory(platformId: string, categoryName: string) {
    const categoryKey = `${platformId}:${slugify(categoryName)}`;
    let category = categoryCache.get(categoryKey);
    if (!category) {
      category = prisma.category.upsert({
        where: { platformId_slug: { platformId, slug: slugify(categoryName) } },
        update: {},
        create: { platformId, name: categoryName, slug: slugify(categoryName) }
      });
      categoryCache.set(categoryKey, category);
    }
    return category;
  }

  async function importOne(s: ProviderServiceDto) {
    const detected = detectPlatform(`${s.category ?? ""} ${s.name}`);
    const platform = await getPlatform(detected);
    const categoryName = s.category?.trim() || "عام";
    const category = await getCategory(platform.id, categoryName);

    const providerService = await prisma.providerService.upsert({
      where: { providerId_providerServiceId: { providerId, providerServiceId: s.providerServiceId } },
      update: {
        providerName: s.name,
        providerCategory: s.category,
        providerRate: s.rate,
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity,
        imported: true
      },
      create: {
        providerId,
        providerServiceId: s.providerServiceId,
        providerName: s.name,
        providerCategory: s.category,
        providerRate: s.rate,
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity,
        imported: true
      }
    });

    const existingService = await prisma.service.findUnique({ where: { providerServiceId: providerService.id } });
    if (existingService) {
      skipped++;
    } else {
      const pricePer1000 = calcSellingPrice(s.rate, "PERCENT", markupPercent);
      await prisma.service.create({
        data: {
          providerServiceId: providerService.id,
          providerId,
          providerRefId: s.providerServiceId,
          platformId: platform.id,
          categoryId: category.id,
          name: s.name,
          providerCost: s.rate,
          markupType: "PERCENT",
          markupValue: markupPercent,
          pricePer1000: pricePer1000.toFixed(2),
          minQuantity: s.minQuantity,
          maxQuantity: s.maxQuantity,
          active: true,
          refill: s.refill ?? false,
          cancelSupported: s.cancelSupported ?? false,
          averageTime: s.averageTime
        }
      });
      imported++;
    }

    done++;
    params.onProgress?.(done, services.length);
  }

  for (let i = 0; i < services.length; i += concurrency) {
    const batch = services.slice(i, i + concurrency);
    await Promise.all(batch.map(importOne));
  }

  return { imported, skipped, total: services.length };
}
