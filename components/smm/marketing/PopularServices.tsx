import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { PlatformIcon } from "@/components/smm/ui/PlatformIcon";
import { Button } from "@/components/smm/ui/Button";

// "الخدمات الأكثر طلبًا" — ranked by actual order count, not a curated or
// fake list. A brand-new deployment has no order history yet, so this
// falls back to the newest active services rather than showing nothing.
export async function PopularServices() {
  const topOrdered = await prisma.order.groupBy({
    by: ["serviceId"],
    _count: { serviceId: true },
    orderBy: { _count: { serviceId: "desc" } },
    take: 6
  });

  const services =
    topOrdered.length > 0
      ? await prisma.service
          .findMany({
            where: { id: { in: topOrdered.map((t) => t.serviceId) }, active: true },
            include: { platform: true }
          })
          .then((rows) => {
            const order = new Map(topOrdered.map((t, i) => [t.serviceId, i]));
            return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
          })
      : await prisma.service.findMany({
          where: { active: true },
          orderBy: { createdAt: "desc" },
          take: 6,
          include: { platform: true }
        });

  if (services.length === 0) return null;

  return (
    <section className="bg-surface2/40 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">الخدمات الأكثر طلبًا</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">الخدمات التي يثق بها عملاؤنا أكثر</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border2 bg-surface p-4">
              <PlatformIcon slug={s.platform.slug} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-fg">{s.name}</p>
                <p className="text-xs text-muted">{s.platform.name}</p>
              </div>
              <p className="shrink-0 text-sm font-extrabold text-brand-600 dark:text-brand-300">{s.pricePer1000.toFixed(2)} ر.س</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register">
            <Button>تصفّح كل الخدمات</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
