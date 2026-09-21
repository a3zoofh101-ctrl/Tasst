import { prisma } from "@/lib/smm/db/prisma";
import { PlatformIcon } from "@/components/smm/ui/PlatformIcon";

export async function PlatformsShowcase() {
  const platforms = await prisma.platform.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { services: { where: { active: true } } } } }
  });

  return (
    <section id="services" className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-extrabold text-fg sm:text-3xl">الخدمات المتوفرة</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">خدمات لجميع أهم منصات التواصل الاجتماعي</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {platforms.map((p) => (
            <div key={p.id} className="flex flex-col items-center gap-2 rounded-2xl border border-border2 bg-surface p-5 text-center transition-colors hover:border-brand-300 dark:hover:border-brand-700">
              <PlatformIcon slug={p.slug} size="lg" />
              <p className="text-sm font-semibold text-fg">{p.name}</p>
              <p className="text-xs text-muted">{p._count.services} خدمة</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
