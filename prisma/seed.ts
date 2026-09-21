import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import Decimal from "decimal.js";
import { MockSmmProvider } from "../lib/smm/providers/mock";
import { calcSellingPrice } from "../lib/smm/money";

const prisma = new PrismaClient();

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
