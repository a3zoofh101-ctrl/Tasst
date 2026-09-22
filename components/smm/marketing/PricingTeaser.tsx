import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { Button } from "@/components/smm/ui/Button";

export async function PricingTeaser() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { pricePer1000: "asc" },
    take: 3,
    include: { platform: true }
  });

  if (services.length === 0) return null;

  return (
    <section id="pricing" className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">أسعار شفافة وواضحة</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">تدفع فقط مقابل ما تطلبه، بدون رسوم خفية</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="smm-glass rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-300">{s.platform.name}</p>
              <h3 className="mt-1 font-bold text-fg">{s.name}</h3>
              <p className="mt-3 text-3xl font-extrabold text-fg">
                {s.pricePer1000.toFixed(2)} <span className="text-sm font-medium text-muted">ر.س / 1000</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register">
            <Button>ابدأ الطلب الآن</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
