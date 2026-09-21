import Link from "next/link";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { OrderStatusBadge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { Button } from "@/components/smm/ui/Button";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { service: true }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">طلباتي</h1>
        <p className="mt-1 text-sm text-muted">جميع طلباتك مع تفاصيل الحالة والتنفيذ</p>
      </div>

      <Card>
        <CardContent className="!p-0">
          {orders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="لا توجد طلبات بعد"
                description="ابدأ بطلب أول خدمة لك الآن"
                action={
                  <Link href="/dashboard/new-order">
                    <Button size="sm">طلب جديد</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>رقم الطلب</Th>
                    <Th>الخدمة</Th>
                    <Th>الرابط</Th>
                    <Th>الكمية</Th>
                    <Th>السعر</Th>
                    <Th>المتبقي</Th>
                    <Th>الحالة</Th>
                    <Th>التاريخ</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {orders.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link href={`/dashboard/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
                          {formatOrderNumber(o.seq)}
                        </Link>
                      </Td>
                      <Td className="max-w-[180px] truncate">{o.service.name}</Td>
                      <Td className="max-w-[160px] truncate text-xs text-muted">{o.link}</Td>
                      <Td>{formatNumber(o.quantity)}</Td>
                      <Td>{formatMoney(o.sellingPrice)}</Td>
                      <Td>{o.remains != null ? formatNumber(o.remains) : "—"}</Td>
                      <Td>
                        <OrderStatusBadge status={o.status} />
                      </Td>
                      <Td className="text-xs text-muted">{o.createdAt.toLocaleDateString("ar-SA")}</Td>
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
