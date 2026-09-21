import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";
import { MockSmmProvider } from "../lib/smm/providers/mock";
import { GenericSmmProvider } from "../lib/smm/providers/generic";
import { calcSellingPrice } from "../lib/smm/money";
import { encryptSecret } from "../lib/smm/auth/encryption";

const prisma = new PrismaClient();

function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "general";
}

// Maps a provider's free-text category/service name to one of our existing
// platform slugs where possible (so real services land in the same
// platform tab as the mock ones), or creates a new platform on the fly.
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

function detectPlatform(text: string): { slug: string; name: string } {
  const lower = ` ${text.toLowerCase()} `;
  for (const p of PLATFORM_KEYWORDS) {
    if (p.keywords.some((k) => lower.includes(k))) return p;
  }
  return { slug: "other", name: "أخرى" };
}

/**
 * Optional: connects a real SMM provider (any panel using the classic
 * action=services/add/status/balance API) and imports its *entire*
 * catalog automatically, active with a configurable markup (0% by
 * default — for personal use, not resale).
 *
 * Entirely opt-in via env vars so the script stays safe to run with no
 * real credentials configured (the default/CI path). The API key is
 * never hardcoded here — only ever read from the environment and
 * encrypted before it touches the database.
 */
async function seedRealProvider() {
  const name = process.env.SEED_REAL_PROVIDER_NAME;
  const apiUrl = process.env.SEED_REAL_PROVIDER_API_URL;
  const apiKey = process.env.SEED_REAL_PROVIDER_API_KEY;
  const markupPercent = process.env.SEED_REAL_PROVIDER_MARKUP_PERCENT ?? "0";

  if (!apiUrl || !apiKey) {
    console.log("ℹ️  SEED_REAL_PROVIDER_API_URL/KEY not set — skipping real provider import.");
    return;
  }

  const providerName = name || "مزوّد حقيقي";
  console.log(`🔌 Connecting real provider "${providerName}" (${apiUrl})...`);

  const provider = await prisma.provider.upsert({
    where: { id: "seed-real-provider" },
    update: { name: providerName, apiUrl, apiKeyEncrypted: encryptSecret(apiKey), active: true },
    create: {
      id: "seed-real-provider",
      name: providerName,
      type: "GENERIC",
      apiUrl,
      apiKeyEncrypted: encryptSecret(apiKey),
      active: true
    }
  });

  const adapter = new GenericSmmProvider(apiUrl, apiKey);

  let services;
  try {
    const [balance, catalog] = await Promise.all([adapter.getBalance(), adapter.getServices()]);
    services = catalog;
    await prisma.provider.update({ where: { id: provider.id }, data: { balance } });
    console.log(`   balance: ${balance} — ${services.length} service(s) in catalog`);
  } catch (err) {
    console.warn(
      `⚠️  Could not reach "${providerName}" right now (${err instanceof Error ? err.message : err}). ` +
        "The provider was saved — re-run `npx prisma db seed` once network access is available to sync its catalog."
    );
    return;
  }

  const platformCache = new Map<string, { id: string }>();
  const categoryCache = new Map<string, { id: string }>();
  let platformSortOrder = 100;
  let imported = 0;
  let skipped = 0;

  for (const s of services) {
    const detected = detectPlatform(`${s.category ?? ""} ${s.name}`);

    let platform = platformCache.get(detected.slug);
    if (!platform) {
      platform = await prisma.platform.upsert({
        where: { slug: detected.slug },
        update: {},
        create: { name: detected.name, slug: detected.slug, sortOrder: platformSortOrder++ }
      });
      platformCache.set(detected.slug, platform);
    }

    const categoryName = s.category?.trim() || "عام";
    const categoryKey = `${platform.id}:${slugify(categoryName)}`;
    let category = categoryCache.get(categoryKey);
    if (!category) {
      category = await prisma.category.upsert({
        where: { platformId_slug: { platformId: platform.id, slug: slugify(categoryName) } },
        update: {},
        create: { platformId: platform.id, name: categoryName, slug: slugify(categoryName) }
      });
      categoryCache.set(categoryKey, category);
    }

    const providerService = await prisma.providerService.upsert({
      where: { providerId_providerServiceId: { providerId: provider.id, providerServiceId: s.providerServiceId } },
      update: {
        providerName: s.name,
        providerCategory: s.category,
        providerRate: s.rate,
        minQuantity: s.minQuantity,
        maxQuantity: s.maxQuantity,
        imported: true
      },
      create: {
        providerId: provider.id,
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
      continue;
    }

    const pricePer1000 = calcSellingPrice(s.rate, "PERCENT", markupPercent);

    await prisma.service.create({
      data: {
        providerServiceId: providerService.id,
        providerId: provider.id,
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

  console.log(`✅ Real provider "${providerName}": ${imported} service(s) imported and activated, ${skipped} already existed.`);
}

const PLATFORM_SLUG_TO_SERVICE_PREFIX: Record<string, string> = {
  "x-twitter": "mock-tw-",
  instagram: "mock-ig-",
  tiktok: "mock-tt-",
  youtube: "mock-yt-",
  snapchat: "mock-sc-",
  telegram: "mock-tg-"
};

const PLATFORMS = [
  { name: "X (تويتر)", slug: "x-twitter" },
  { name: "إنستغرام", slug: "instagram" },
  { name: "تيك توك", slug: "tiktok" },
  { name: "يوتيوب", slug: "youtube" },
  { name: "سناب شات", slug: "snapchat" },
  { name: "تيليجرام", slug: "telegram" }
];

function categorySlug(name: string) {
  const map: Record<string, string> = { متابعون: "followers", تفاعل: "engagement", مشاهدات: "views" };
  return map[name] ?? name;
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1) Mock provider
  const provider = await prisma.provider.upsert({
    where: { id: "seed-mock-provider" },
    update: {},
    create: { id: "seed-mock-provider", name: "المزوّد التجريبي", type: "MOCK", active: true, balance: 5000 }
  });

  // 2) Platforms + categories
  const platformBySlug = new Map<string, { id: string }>();
  for (const [index, p] of PLATFORMS.entries()) {
    const platform = await prisma.platform.upsert({
      where: { slug: p.slug },
      update: {},
      create: { name: p.name, slug: p.slug, sortOrder: index }
    });
    platformBySlug.set(p.slug, platform);
  }

  const categoryCache = new Map<string, { id: string }>();
  async function getOrCreateCategory(platformId: string, name: string) {
    const slug = categorySlug(name);
    const key = `${platformId}:${slug}`;
    if (categoryCache.has(key)) return categoryCache.get(key)!;
    const category = await prisma.category.upsert({
      where: { platformId_slug: { platformId, slug } },
      update: {},
      create: { platformId, name, slug }
    });
    categoryCache.set(key, category);
    return category;
  }

  // 3) Sync the mock provider's catalog into ProviderService rows, then
  // curate + import active Services (same path the admin UI uses).
  const mock = new MockSmmProvider();
  const mockServices = await mock.getServices();

  for (const [slug, prefix] of Object.entries(PLATFORM_SLUG_TO_SERVICE_PREFIX)) {
    const platform = platformBySlug.get(slug)!;
    const servicesForPlatform = mockServices.filter((s) => s.providerServiceId.startsWith(prefix));

    for (const s of servicesForPlatform) {
      const providerService = await prisma.providerService.upsert({
        where: { providerId_providerServiceId: { providerId: provider.id, providerServiceId: s.providerServiceId } },
        update: { providerName: s.name, providerRate: s.rate, minQuantity: s.minQuantity, maxQuantity: s.maxQuantity },
        create: {
          providerId: provider.id,
          providerServiceId: s.providerServiceId,
          providerName: s.name,
          providerCategory: s.category,
          providerRate: s.rate,
          minQuantity: s.minQuantity,
          maxQuantity: s.maxQuantity,
          imported: true
        }
      });

      const category = await getOrCreateCategory(platform.id, s.category ?? "عام");
      const markupValue = 60; // 60% markup over provider cost
      const pricePer1000 = calcSellingPrice(s.rate, "PERCENT", markupValue);

      const existingService = await prisma.service.findUnique({ where: { providerServiceId: providerService.id } });
      if (!existingService) {
        await prisma.service.create({
          data: {
            providerServiceId: providerService.id,
            providerId: provider.id,
            providerRefId: s.providerServiceId,
            platformId: platform.id,
            categoryId: category.id,
            name: s.name,
            description: `خدمة ${s.name} بجودة عالية وسرعة تنفيذ ممتازة.`,
            providerCost: s.rate,
            markupType: "PERCENT",
            markupValue,
            pricePer1000: pricePer1000.toFixed(2),
            minQuantity: s.minQuantity,
            maxQuantity: s.maxQuantity,
            active: true,
            refill: s.refill ?? false,
            cancelSupported: s.cancelSupported ?? false,
            averageTime: s.averageTime
          }
        });
      }
    }
  }

  // 3b) Optional: a real provider, fully driven by env vars (see
  // seedRealProvider() above) — no-ops if not configured.
  await seedRealProvider();

  // 4) Admin user from env vars (never hardcoded)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "مدير المنصة";

  if (!adminEmail || !adminPassword) {
    console.warn("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user creation.");
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        wallet: { create: { balance: 0 } }
      }
    });
    console.log(`✅ Admin user ready: ${adminEmail}`);
  }

  // 5) A demo customer account for local testing, with a starting balance
  // recorded as a proper wallet transaction (never a bare balance write).
  const demoEmail = "demo@tasst.local";
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail }, include: { wallet: true } });
  if (!demoUser) {
    const passwordHash = await bcrypt.hash("Demo1234!", 12);
    demoUser = await prisma.user.create({
      data: { name: "عميل تجريبي", email: demoEmail, passwordHash, role: "USER", wallet: { create: { balance: 0 } } },
      include: { wallet: true }
    });
  }
  if (demoUser.wallet) {
    const existingCredits = await prisma.walletTransaction.count({ where: { walletId: demoUser.wallet.id } });
    if (existingCredits === 0) {
      const amount = new Decimal(500);
      await prisma.$transaction([
        prisma.wallet.update({ where: { id: demoUser.wallet.id }, data: { balance: { increment: amount.toFixed(2) } } }),
        prisma.walletTransaction.create({
          data: {
            walletId: demoUser.wallet.id,
            type: "ADMIN_CREDIT",
            amount: amount.toFixed(2),
            balanceBefore: "0.00",
            balanceAfter: amount.toFixed(2),
            description: "رصيد ترحيبي (بيانات تجريبية)"
          }
        })
      ]);
    }
  }
  console.log(`✅ Demo user ready: ${demoEmail} / Demo1234!`);

  console.log("🌱 Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
