import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { OrderStatusBadge } from "@/components/smm/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";
import type { OrderStatus } from "@prisma/client";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS", "COMPLETED", "PARTIAL", "CANCELED", "REFUNDED"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const validStatus = STATUS_OPTIONS.find((s) => s === status);

  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { service: true, user: true }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الطلبات</h1>
        <p className="mt-1 text-sm text-muted">جميع طلبات العملاء عبر المنصة</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${!validStatus ? "bg-brand-600 text-white" : "bg-surface2 text-muted"}`}
        >
          الكل
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${validStatus === s ? "bg-brand-600 text-white" : "bg-surface2 text-muted"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="!p-0">
          {orders.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد طلبات" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>رقم الطلب</Th>
                    <Th>العميل</Th>
                    <Th>الخدمة</Th>
                    <Th>الكمية</Th>
                    <Th>السعر</Th>
                    <Th>التكلفة</Th>
                    <Th>الربح</Th>
                    <Th>الحالة</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {orders.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link href={`/admin/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                          {formatOrderNumber(o.seq)}
                        </Link>
                      </Td>
                      <Td className="text-xs text-muted">{o.user.name}</Td>
                      <Td className="max-w-[160px] truncate">{o.service.name}</Td>
                      <Td>{formatNumber(o.quantity)}</Td>
                      <Td>{formatMoney(o.sellingPrice)}</Td>
                      <Td className="text-xs text-muted">{formatMoney(o.providerCost)}</Td>
                      <Td className="text-success">{formatMoney(o.profit)}</Td>
                      <Td>
                        <OrderStatusBadge status={o.status} />
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
