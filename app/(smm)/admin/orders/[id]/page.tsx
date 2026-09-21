import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { OrderStatusBadge } from "@/components/smm/ui/Badge";
import { QueryStatusButton, RetryOrderButton } from "@/components/smm/admin/OrderActions";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { service: true, provider: true, user: true }
  });
  if (!order) notFound();

  const canRetry = order.status === "REFUNDED" && !order.providerOrderId;

  const rows: [string, React.ReactNode][] = [
    ["رقم الطلب", formatOrderNumber(order.seq)],
    ["العميل", `${order.user.name} (${order.user.email})`],
    ["الخدمة", order.service.name],
    ["المزود", order.provider.name],
    ["Provider Order ID", order.providerOrderId ?? "—"],
    ["الرابط", order.link],
    ["الكمية", formatNumber(order.quantity)],
    ["Start Count", order.startCount != null ? formatNumber(order.startCount) : "—"],
    ["المتبقي", order.remains != null ? formatNumber(order.remains) : "—"],
    ["سعر البيع", formatMoney(order.sellingPrice)],
    ["تكلفة المزود", formatMoney(order.providerCost)],
    ["الربح", formatMoney(order.profit)],
    ["تاريخ الإنشاء", order.createdAt.toLocaleString("ar-SA")],
    ["آخر تحديث", order.updatedAt.toLocaleString("ar-SA")]
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/admin/orders" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowRight className="size-4" />
        العودة للطلبات
      </Link>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-fg">{formatOrderNumber(order.seq)}</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          {order.failureReason && (
            <p className="rounded-xl bg-warning-bg px-3 py-2.5 text-sm text-warning">{order.failureReason}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {order.providerOrderId && <QueryStatusButton orderId={order.id} />}
            {canRetry && <RetryOrderButton orderId={order.id} />}
          </div>

          <dl className="divide-y divide-border2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="shrink-0 text-muted">{label}</dt>
                <dd className="max-w-[65%] truncate text-left font-semibold text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
