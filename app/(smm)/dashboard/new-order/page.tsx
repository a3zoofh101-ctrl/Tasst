import { Suspense } from "react";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { NewOrderWizard } from "@/components/smm/dashboard/NewOrderWizard";
import { getPlatformServicesAction } from "@/lib/smm/actions/catalog";

async function NewOrderContent({ serviceId }: { serviceId?: string }) {
  const user = await requireUser();

  // Only the requested service's ID is known up front, not its full row —
  // resolve its platform first so the right platform (and only that
  // platform's services) is preloaded, instead of fetching every Service
  // row in the catalog to figure out where a single id belongs.
  const preselectedService = serviceId ? await prisma.service.findUnique({ where: { id: serviceId }, select: { platformId: true } }) : null;

  const [platforms, wallet] = await Promise.all([
    prisma.platform.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.wallet.findUnique({ where: { userId: user.id } })
  ]);

  const initialPlatformId = preselectedService?.platformId ?? platforms[0]?.id ?? "";
  const initialServices = initialPlatformId ? await getPlatformServicesAction(initialPlatformId) : [];

  return (
    <NewOrderWizard
      platforms={platforms.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))}
      initialPlatformId={initialPlatformId}
      initialServices={initialServices}
      preselectedServiceId={serviceId}
      balance={wallet?.balance.toFixed(2) ?? "0.00"}
    />
  );
}

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ serviceId?: string }> }) {
  const { serviceId } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">طلب جديد</h1>
        <p className="mt-1 text-sm text-muted">اختر المنصة والخدمة وأدخل التفاصيل لإتمام طلبك خلال ثوانٍ</p>
      </div>
      <Suspense>
        <NewOrderContent serviceId={serviceId} />
      </Suspense>
    </div>
  );
}
