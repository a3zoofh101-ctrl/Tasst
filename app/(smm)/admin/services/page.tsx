import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { formatNumber } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { Input } from "@/components/smm/ui/Input";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";
import { ImportServiceDialog } from "@/components/smm/admin/ImportServiceDialog";
import { EditServiceDialog } from "@/components/smm/admin/EditServiceDialog";
import { ToggleServiceButton } from "@/components/smm/admin/ToggleServiceButton";
import { DeleteServiceButton } from "@/components/smm/admin/DeleteServiceButton";
import { ReclassifyPlatformsButton } from "@/components/smm/admin/ReclassifyPlatformsButton";
import { RollbackReclassifyButton } from "@/components/smm/admin/RollbackReclassifyButton";
import type { Prisma } from "@prisma/client";

// Reclassifying pages through every managed service — give the server
// action more than the platform default before it's cut off on a large
// catalog (each individual page call is bounded, see catalog-import.ts).
export const maxDuration = 300;

const PAGE_SIZE = 100;

export default async function AdminServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; platformId?: string }> }) {
  const { q, platformId } = await searchParams;

  // The managed-services table used to fetch every row with no limit —
  // fine when the catalog was a handful of seeded services, but a real
  // provider import can run into the thousands (this hit ~4,900 in
  // production) and rendering all of them in one server-rendered table
  // made the page itself fail to load. Now capped at PAGE_SIZE with a
  // name search + platform filter to find a specific service instead.
  const where: Prisma.ServiceWhereInput = {
    ...(platformId ? { platformId } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {})
  };

  const [servicesTotal, services, pendingProviderServices, platforms] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({ where, orderBy: { createdAt: "desc" }, take: PAGE_SIZE, include: { platform: true, category: true } }),
    prisma.providerService.findMany({ where: { imported: false }, orderBy: { syncedAt: "desc" }, take: 100, include: { provider: true } }),
    prisma.platform.findMany({ orderBy: { sortOrder: "asc" }, include: { categories: { where: { active: true } }, _count: { select: { services: true } } } })
  ]);
  const activePlatforms = platforms.filter((p) => p.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">الخدمات</h1>
          <p className="mt-1 text-sm text-muted">استورد الخدمات من المزودين وحدّد هامش الربح قبل تفعيلها للعملاء</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReclassifyPlatformsButton />
          <RollbackReclassifyButton />
        </div>
      </div>

      <Card>
        <CardContent className="!p-0">
          <h2 className="p-5 pb-3 font-bold text-fg">خدمات جديدة من المزودين ({pendingProviderServices.length})</h2>
          {pendingProviderServices.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد خدمات بانتظار الاستيراد" description="استخدم زر مزامنة الخدمات من صفحة المزودين" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>اسم المزود للخدمة</Th>
                    <Th>المزود</Th>
                    <Th>تكلفة / 1000</Th>
                    <Th>الحدود</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <tbody>
                  {pendingProviderServices.map((ps) => (
                    <Tr key={ps.id}>
                      <Td className="max-w-[220px] truncate">{ps.providerName}</Td>
                      <Td className="text-xs text-muted">{ps.provider.name}</Td>
                      <Td>{ps.providerRate.toFixed(4)} ر.س</Td>
                      <Td className="text-xs text-muted">
                        {formatNumber(ps.minQuantity)} - {formatNumber(ps.maxQuantity)}
                      </Td>
                      <Td>
                        <ImportServiceDialog
                          providerServiceId={ps.id}
                          suggestedName={ps.providerName}
                          providerRate={ps.providerRate.toFixed(4)}
                          platforms={activePlatforms.map((p) => ({ id: p.id, name: p.name, categories: p.categories.map((c) => ({ id: c.id, name: c.name })) }))}
                        />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="!p-0">
          <div className="space-y-3 p-5 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-bold text-fg">
                الخدمات المُدارة ({formatNumber(servicesTotal)}
                {servicesTotal > services.length ? ` — يعرض أول ${formatNumber(services.length)}` : ""})
              </h2>
              <form className="w-full max-w-xs sm:w-auto">
                {platformId && <input type="hidden" name="platformId" value={platformId} />}
                <Input name="q" defaultValue={q} placeholder="ابحث باسم الخدمة..." />
              </form>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={q ? `/admin/services?q=${encodeURIComponent(q)}` : "/admin/services"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${!platformId ? "bg-brand-600 text-white" : "bg-surface2 text-muted"}`}
              >
                الكل ({formatNumber(platforms.reduce((sum, p) => sum + p._count.services, 0))})
              </Link>
              {platforms.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/services?platformId=${p.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${platformId === p.id ? "bg-brand-600 text-white" : "bg-surface2 text-muted"}`}
                >
                  {p.name} ({formatNumber(p._count.services)})
                </Link>
              ))}
            </div>
          </div>
          {services.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState title="لا توجد خدمات مطابقة" description={q || platformId ? "جرّب تعديل البحث أو التصنيف" : undefined} />
            </div>
          ) : (
            <div className="p-5 pt-0">
              <Table>
                <Thead>
                  <Tr>
                    <Th>الاسم</Th>
                    <Th>المنصة</Th>
                    <Th>التصنيف</Th>
                    <Th>التكلفة</Th>
                    <Th>سعر البيع</Th>
                    <Th>الحالة</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <tbody>
                  {services.map((s) => (
                    <Tr key={s.id}>
                      <Td className="max-w-[180px] truncate font-medium">{s.name}</Td>
                      <Td className="text-xs text-muted">{s.platform.name}</Td>
                      <Td className="text-xs text-muted">{s.category.name}</Td>
                      <Td className="text-xs text-muted">{s.providerCost.toFixed(4)}</Td>
                      <Td className="font-semibold">{s.pricePer1000.toFixed(2)}</Td>
                      <Td>
                        <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "مفعّلة" : "مخفية"}</Badge>
                      </Td>
                      <Td>
                        <div className="flex gap-1.5">
                          <EditServiceDialog
                            platforms={activePlatforms.map((p) => ({ id: p.id, name: p.name, categories: p.categories.map((c) => ({ id: c.id, name: c.name })) }))}
                            service={{
                              id: s.id,
                              platformId: s.platformId,
                              categoryId: s.categoryId,
                              name: s.name,
                              description: s.description,
                              providerCost: s.providerCost.toFixed(4),
                              markupType: s.markupType,
                              markupValue: s.markupValue.toFixed(2),
                              minQuantity: s.minQuantity,
                              maxQuantity: s.maxQuantity,
                              refill: s.refill,
                              cancelSupported: s.cancelSupported,
                              averageTime: s.averageTime
                            }}
                          />
                          <ToggleServiceButton serviceId={s.id} active={s.active} />
                          <DeleteServiceButton serviceId={s.id} serviceName={s.name} />
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
