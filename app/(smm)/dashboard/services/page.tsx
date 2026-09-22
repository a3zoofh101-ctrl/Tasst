import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { ServicesExplorer, type ServiceDto, type PlatformDto } from "@/components/smm/dashboard/ServicesExplorer";

// Default landing view: a modest, indexed, name-sorted slice instead of
// the whole active catalog (~5,000 rows in production) — see
// ServicesExplorer's comment for why that mattered on mobile.
const INITIAL_PAGE_SIZE = 60;

export default async function ServicesPage() {
  const user = await requireUser();

  const [platforms, services, favorites] = await Promise.all([
    prisma.platform.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        categories: { where: { active: true }, orderBy: { sortOrder: "asc" } },
        _count: { select: { services: { where: { active: true } } } }
      }
    }),
    prisma.service.findMany({
      where: { active: true },
      include: { platform: true, category: true },
      orderBy: { name: "asc" },
      take: INITIAL_PAGE_SIZE
    }),
    prisma.serviceFavorite.findMany({ where: { userId: user.id }, select: { serviceId: true } })
  ]);

  const favoriteIds = new Set(favorites.map((f) => f.serviceId));

  const platformDtos: PlatformDto[] = platforms.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    icon: p.icon,
    serviceCount: p._count.services,
    categories: p.categories.map((c) => ({ id: c.id, name: c.name }))
  }));

  const serviceDtos: ServiceDto[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    platformId: s.platformId,
    platformName: s.platform.name,
    platformSlug: s.platform.slug,
    categoryId: s.categoryId,
    categoryName: s.category.name,
    pricePer1000: s.pricePer1000.toFixed(2),
    minQuantity: s.minQuantity,
    maxQuantity: s.maxQuantity,
    refill: s.refill,
    cancelSupported: s.cancelSupported,
    averageTime: s.averageTime,
    favorited: favoriteIds.has(s.id)
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الخدمات</h1>
        <p className="mt-1 text-sm text-muted">تصفح جميع الخدمات المتاحة حسب المنصة والتصنيف</p>
      </div>
      <ServicesExplorer platforms={platformDtos} initialServices={serviceDtos} />
    </div>
  );
}
