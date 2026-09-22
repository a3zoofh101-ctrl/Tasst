import Link from "next/link";
import { Wallet, ListOrdered, CheckCircle2, Loader2, Plus, LifeBuoy } from "lucide-react";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { formatOrderNumber } from "@/lib/smm/orders";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Button } from "@/components/smm/ui/Button";
import { OrderStatusBadge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";

export default async function DashboardOverviewPage() {
  const user = await requireUser();

  const [totalOrders, completedOrders, activeOrders, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.count({ where: { userId: user.id, status: "COMPLETED" } }),
    prisma.order.count({ where: { userId: user.id, status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] } } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { service: true }
    })
  ]);

  const stats = [
    { label: "إجمالي الطلبات", value: formatNumber(totalOrders), icon: ListOrdered, tone: "text-fg bg-surface2" },
    { label: "الطلبات المكتملة", value: formatNumber(completedOrders), icon: CheckCircle2, tone: "text-success bg-success-bg" },
    { label: "قيد التنفيذ", value: formatNumber(activeOrders), icon: Loader2, tone: "text-warning bg-warning-bg" }
  ];

  const quickActions = [
    { href: "/dashboard/new-order", label: "طلب جديد", icon: Plus },
    { href: "/dashboard/wallet", label: "إضافة رصيد", icon: Wallet },
    { href: "/dashboard/orders", label: "طلباتي", icon: ListOrdered },
    { href: "/dashboard/support", label: "الدعم الفني", icon: LifeBuoy }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">مرحبًا، {user.name.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-muted">نظرة سريعة على حسابك وطلباتك</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3">
              <span className={`flex size-11 items-center justify-center rounded-xl ${s.tone}`}>
                <s.icon className="size-5" />
              </span>
              <div>
                <p className="text-xs font-medium text-muted">{s.label}</p>
                <p className="text-lg font-bold text-fg">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}>
            <Button variant="outline" className="w-full">
              <a.icon className="size-4" />
              {a.label}
            </Button>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="!p-0">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold text-fg">آخر الطلبات</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-brand-600 hover:underline">
              عرض الكل
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 pb-5">
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
                  {recentOrders.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <Link href={`/dashboard/orders/${o.id}`} className="font-semibold text-brand-600 hover:underline">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
