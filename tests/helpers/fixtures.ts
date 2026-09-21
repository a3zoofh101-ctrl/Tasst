import { randomUUID } from "crypto";
import { prisma } from "@/lib/smm/db/prisma";
import { hashPassword } from "@/lib/smm/auth/password";

export async function createTestUser(overrides: { balance?: string } = {}) {
  const suffix = randomUUID().slice(0, 8);
  const user = await prisma.user.create({
    data: {
      name: `مستخدم اختبار ${suffix}`,
      email: `test-${suffix}@example.com`,
      passwordHash: await hashPassword("Password123!"),
      wallet: { create: { balance: overrides.balance ?? "0" } }
    },
    include: { wallet: true }
  });
  return user;
}

export async function createMockProviderService(overrides: {
  pricePer1000?: string;
  providerCost?: string;
  minQuantity?: number;
  maxQuantity?: number;
  active?: boolean;
} = {}) {
  const suffix = randomUUID().slice(0, 8);

  const platform = await prisma.platform.create({ data: { name: `منصة ${suffix}`, slug: `platform-${suffix}` } });
  const category = await prisma.category.create({ data: { platformId: platform.id, name: "متابعون", slug: "followers" } });
  const provider = await prisma.provider.create({ data: { name: `مزود ${suffix}`, type: "MOCK", active: true } });

  const service = await prisma.service.create({
    data: {
      providerId: provider.id,
      providerRefId: "mock-tw-followers",
      platformId: platform.id,
      categoryId: category.id,
      name: `خدمة ${suffix}`,
      providerCost: overrides.providerCost ?? "3.0000",
      markupType: "PERCENT",
      markupValue: "100",
      pricePer1000: overrides.pricePer1000 ?? "6.00",
      minQuantity: overrides.minQuantity ?? 100,
      maxQuantity: overrides.maxQuantity ?? 100000,
      active: overrides.active ?? true
    }
  });

  return { platform, category, provider, service };
}
