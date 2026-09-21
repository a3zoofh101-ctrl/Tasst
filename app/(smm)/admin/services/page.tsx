import { prisma } from "@/lib/smm/db/prisma";
import { formatNumber } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";
import { ImportServiceDialog } from "@/components/smm/admin/ImportServiceDialog";
import { EditServiceDialog } from "@/components/smm/admin/EditServiceDialog";
import { ToggleServiceButton } from "@/components/smm/admin/ToggleServiceButton";

export default async function AdminServicesPage() {
  const [services, pendingProviderServices, platforms] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: "desc" }, include: { platform: true, category: true } }),
    prisma.providerService.findMany({ where: { imported: false }, orderBy: { syncedAt: "desc" }, take: 100, include: { provider: true } }),
    prisma.platform.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, include: { categories: { where: { active: true } } } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الخدمات</h1>
        <p className="mt-1 text-sm text-muted">استورد الخدمات من المزودين وحدّد هامش الربح قبل تفعيلها للعملاء</p>
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
                          platforms={platforms.map((p) => ({ id: p.id, name: p.name, categories: p.categories.map((c) => ({ id: c.id, name: c.name })) }))}
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
          <h2 className="p-5 pb-3 font-bold text-fg">الخدمات المُدارة ({services.length})</h2>
          {services.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد خدمات بعد" />
            </div>
          ) : (
            <div className="p-5">
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
                            service={{
                              id: s.id,
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
