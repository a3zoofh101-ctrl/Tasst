import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { formatDate } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { OrdersTable, type OrderRow } from "@/components/smm/dashboard/OrdersTable";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { service: true }
  });

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: formatOrderNumber(o.seq),
    serviceName: o.service.name,
    link: o.link,
    quantity: formatNumber(o.quantity),
    price: formatMoney(o.sellingPrice),
    remains: o.remains != null ? formatNumber(o.remains) : "—",
    status: o.status,
    date: formatDate(o.createdAt)
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">طلباتي</h1>
        <p className="mt-1 text-sm text-muted">جميع طلباتك مع تفاصيل الحالة والتنفيذ</p>
      </div>

      <Card glass>
        <CardContent className="!p-0">
          <OrdersTable orders={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
