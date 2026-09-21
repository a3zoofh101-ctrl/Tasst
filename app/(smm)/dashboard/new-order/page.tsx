import { Suspense } from "react";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { NewOrderWizard, type ServiceOption } from "@/components/smm/dashboard/NewOrderWizard";

async function NewOrderContent() {
  const user = await requireUser();

  const [platforms, services, wallet] = await Promise.all([
    prisma.platform.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.service.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: "asc" }
    }),
    prisma.wallet.findUnique({ where: { userId: user.id } })
  ]);

  const serviceOptions: ServiceOption[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    platformId: s.platformId,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    pricePer1000: s.pricePer1000.toFixed(2),
    minQuantity: s.minQuantity,
    maxQuantity: s.maxQuantity,
    refill: s.refill,
    averageTime: s.averageTime
  }));

  return (
    <NewOrderWizard
      platforms={platforms.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))}
      services={serviceOptions}
      balance={wallet?.balance.toFixed(2) ?? "0.00"}
    />
  );
}

export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">طلب جديد</h1>
        <p className="mt-1 text-sm text-muted">اختر المنصة والخدمة وأدخل التفاصيل لإتمام طلبك خلال ثوانٍ</p>
      </div>
      <Suspense>
        <NewOrderContent />
      </Suspense>
    </div>
  );
}
