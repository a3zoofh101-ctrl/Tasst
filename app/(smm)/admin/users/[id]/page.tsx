import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/smm/db/prisma";
import { getOrCreateWallet } from "@/lib/smm/wallet";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { formatDateTime } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge, OrderStatusBadge } from "@/components/smm/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { AdjustBalanceDialog } from "@/components/smm/admin/AdjustBalanceDialog";
import { ToggleActiveButton } from "@/components/smm/admin/ToggleActiveButton";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const wallet = await getOrCreateWallet(user.id);
  const [orders, transactions] = await Promise.all([
    prisma.order.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 20, include: { service: true } }),
    prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <div className="space-y-5">
      <Link href="/admin/users" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowRight className="size-4" />
        العودة للمستخدمين
      </Link>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-fg">{user.name}</h1>
            <p className="text-sm text-muted">{user.email}</p>
            {user.phone && <p className="text-sm text-muted">{user.phone}</p>}
            <div className="mt-2 flex items-center gap-2">
              <Badge tone={user.isActive ? "success" : "danger"}>{user.isActive ? "نشط" : "معطّل"}</Badge>
              <Badge tone="brand">{formatMoney(wallet.balance)}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdjustBalanceDialog userId={user.id} direction="CREDIT" />
            <AdjustBalanceDialog userId={user.id} direction="DEBIT" />
            <ToggleActiveButton userId={user.id} isActive={user.isActive} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="!p-0">
          <h2 className="p-5 pb-3 font-bold text-fg">آخر الطلبات</h2>
          <div className="px-5 pb-5">
            <Table>
              <Thead>
                <Tr>
                  <Th>رقم الطلب</Th>
                  <Th>الخدمة</Th>
                  <Th>الكمية</Th>
                  <Th>السعر</Th>
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
                    <Td>{o.service.name}</Td>
                    <Td>{formatNumber(o.quantity)}</Td>
                    <Td>{formatMoney(o.sellingPrice)}</Td>
                    <Td>
                      <OrderStatusBadge status={o.status} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="!p-0">
          <h2 className="p-5 pb-3 font-bold text-fg">آخر المعاملات المالية</h2>
          <div className="px-5 pb-5">
            <Table>
              <Thead>
                <Tr>
                  <Th>النوع</Th>
                  <Th>المبلغ</Th>
                  <Th>الوصف</Th>
                  <Th>التاريخ</Th>
                </Tr>
              </Thead>
              <tbody>
                {transactions.map((t) => (
                  <Tr key={t.id}>
                    <Td>{t.type}</Td>
                    <Td>{formatMoney(t.amount)}</Td>
                    <Td className="text-xs text-muted">{t.description}</Td>
                    <Td className="text-xs text-muted">{formatDateTime(t.createdAt)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
