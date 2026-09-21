import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { CreateProviderDialog } from "@/components/smm/admin/CreateProviderDialog";
import { SyncServicesButton, RefreshBalanceButton, ToggleProviderButton } from "@/components/smm/admin/ProviderActions";

export default async function AdminProvidersPage() {
  const providers = await prisma.provider.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { providerServices: true, orders: true } } }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">المزودون</h1>
          <p className="mt-1 text-sm text-muted">إدارة مزودي خدمات SMM المتصلين بالمنصة</p>
        </div>
        <CreateProviderDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {providers.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-fg">{p.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="neutral">{p.type}</Badge>
                  <Badge tone={p.active ? "success" : "danger"}>{p.active ? "مفعّل" : "معطّل"}</Badge>
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs text-muted">رصيد المزود</p>
                <p className="font-bold text-fg">{formatMoney(p.balance)}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
              <span>الخدمات المزامَنة: {p._count.providerServices}</span>
              <span>الطلبات: {p._count.orders}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <SyncServicesButton providerId={p.id} />
              <RefreshBalanceButton providerId={p.id} />
              <ToggleProviderButton providerId={p.id} active={p.active} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
