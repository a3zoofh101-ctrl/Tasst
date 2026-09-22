import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { formatDateTime } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { OrderStatusBadge } from "@/components/smm/ui/Badge";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { service: { include: { platform: true, category: true } } }
  });

  if (!order || order.userId !== user.id) notFound();

  const rows: [string, React.ReactNode][] = [
    ["رقم الطلب", formatOrderNumber(order.seq)],
    ["الخدمة", order.service.name],
    ["المنصة", order.service.platform.name],
    ["التصنيف", order.service.category.name],
    ["الرابط", order.link],
    ["الكمية", formatNumber(order.quantity)],
    ["Start Count", order.startCount != null ? formatNumber(order.startCount) : "—"],
    ["المتبقي (Remains)", order.remains != null ? formatNumber(order.remains) : "—"],
    ["السعر", formatMoney(order.sellingPrice)],
    ["تاريخ الإنشاء", formatDateTime(order.createdAt)],
    ["آخر تحديث", formatDateTime(order.updatedAt)]
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/dashboard/orders" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowRight className="size-4" />
        العودة للطلبات
      </Link>

      <Card glass>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-fg">{formatOrderNumber(order.seq)}</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          {order.status === "REFUNDED" && order.failureReason && (
            <p className="rounded-xl bg-warning-bg px-3 py-2.5 text-sm text-warning">{order.failureReason}</p>
          )}

          <dl className="divide-y divide-border2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                <dt className="text-muted">{label}</dt>
                <dd className="max-w-[60%] truncate text-left font-semibold text-fg">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
