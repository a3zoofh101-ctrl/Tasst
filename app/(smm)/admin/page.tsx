import { Users, ListOrdered, DollarSign, TrendingUp, Clock, ShoppingCart } from "lucide-react";
import { getAdminOverview } from "@/lib/smm/admin/analytics";
import { formatMoney, formatNumber } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";

export default async function AdminOverviewPage() {
  const stats = await getAdminOverview();

  const topStats = [
    { label: "إجمالي المستخدمين", value: formatNumber(stats.totalUsers), icon: Users },
    { label: "إجمالي الطلبات", value: formatNumber(stats.totalOrders), icon: ListOrdered },
    { label: "إجمالي المبيعات", value: formatMoney(stats.totalSales), icon: DollarSign },
    { label: "تكلفة المزودين", value: formatMoney(stats.totalProviderCost), icon: ShoppingCart },
    { label: "الربح الإجمالي", value: formatMoney(stats.grossProfit), icon: TrendingUp },
    { label: "طلبات اليوم", value: formatNumber(stats.todayOrders), icon: Clock },
    { label: "طلبات معلّقة", value: formatNumber(stats.pendingOrders), icon: Clock }
  ];

  const periods = [
    { key: "today", label: "اليوم" },
    { key: "last7", label: "آخر 7 أيام" },
    { key: "last30", label: "آخر 30 يوم" },
    { key: "thisMonth", label: "هذا الشهر" }
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted">نظرة عامة على أداء المنصة</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {topStats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30">
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

      <div>
        <h2 className="mb-3 font-bold text-fg">الأداء حسب الفترة</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {periods.map((p) => {
            const d = stats.periods[p.key];
            return (
              <Card key={p.key}>
                <CardContent>
                  <p className="mb-3 text-sm font-semibold text-fg">{p.label}</p>
                  <dl className="space-y-1.5 text-xs">
                    <Row label="المبيعات" value={formatMoney(d.sales)} />
                    <Row label="التكلفة" value={formatMoney(d.cost)} />
                    <Row label="الربح" value={formatMoney(d.profit)} highlight />
                    <Row label="عدد الطلبات" value={formatNumber(d.orderCount)} />
                    <Row label="متوسط قيمة الطلب" value={formatMoney(d.avgOrderValue)} />
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={highlight ? "font-bold text-success" : "font-semibold text-fg"}>{value}</dd>
    </div>
  );
}
