import { prisma } from "@/lib/smm/db/prisma";
import { formatNumber } from "@/lib/smm/money";

export async function Stats() {
  const [users, orders, services, completed] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.order.count({ where: { status: "COMPLETED" } })
  ]);

  const items = [
    { label: "عميل مسجّل", value: users },
    { label: "طلب منفَّذ", value: orders },
    { label: "خدمة متاحة", value: services },
    { label: "طلب مكتمل بنجاح", value: completed }
  ];

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 rounded-3xl border border-border2 bg-surface p-6 sm:grid-cols-4 sm:p-10">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-extrabold text-brand-600 sm:text-4xl">{formatNumber(s.value)}+</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
