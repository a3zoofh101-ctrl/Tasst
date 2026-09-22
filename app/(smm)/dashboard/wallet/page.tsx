import { Suspense } from "react";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { getOrCreateWallet } from "@/lib/smm/wallet";
import { getSettings } from "@/lib/smm/settings";
import { formatMoney } from "@/lib/smm/money";
import { formatDateTime } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { DepositDialog } from "@/components/smm/dashboard/DepositDialog";
import { PaymentCallbackToast } from "@/components/smm/dashboard/PaymentCallbackToast";

const TX_LABELS: Record<string, { label: string; tone: "success" | "danger" | "brand" }> = {
  DEPOSIT: { label: "إيداع", tone: "success" },
  PURCHASE: { label: "شراء", tone: "danger" },
  REFUND: { label: "استرجاع", tone: "brand" },
  ADMIN_CREDIT: { label: "إضافة من الإدارة", tone: "success" },
  ADMIN_DEBIT: { label: "خصم من الإدارة", tone: "danger" }
};

export default async function WalletPage() {
  const user = await requireUser();
  const [wallet, settings] = await Promise.all([getOrCreateWallet(user.id), getSettings()]);

  const transactions = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-5">
      <Suspense>
        <PaymentCallbackToast />
      </Suspense>
      <div>
        <h1 className="text-2xl font-extrabold text-fg">المحفظة</h1>
        <p className="mt-1 text-sm text-muted">تابع رصيدك وسجل عملياتك المالية</p>
      </div>

      <Card glass>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <p className="text-sm text-muted">الرصيد الحالي</p>
            <p className="text-4xl font-extrabold text-fg">{formatMoney(wallet.balance)}</p>
          </div>
          <DepositDialog minAmount={settings.minDepositAmount} maxAmount={settings.maxDepositAmount} />
        </CardContent>
      </Card>

      <Card glass>
        <CardContent className="!p-0">
          <h2 className="p-5 pb-3 font-bold text-fg">سجل العمليات</h2>
          {transactions.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد عمليات بعد" description="ستظهر هنا كل عمليات الإيداع والشراء والاسترجاع" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>النوع</Th>
                    <Th>المبلغ</Th>
                    <Th>الرصيد قبل</Th>
                    <Th>الرصيد بعد</Th>
                    <Th>الوصف</Th>
                    <Th>التاريخ</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {transactions.map((t) => {
                    const isCredit = t.type === "DEPOSIT" || t.type === "REFUND" || t.type === "ADMIN_CREDIT";
                    const cfg = TX_LABELS[t.type];
                    return (
                      <Tr key={t.id}>
                        <Td>
                          <Badge tone={cfg.tone}>{cfg.label}</Badge>
                        </Td>
                        <Td className={isCredit ? "font-semibold text-success" : "font-semibold text-danger"}>
                          {isCredit ? "+" : "-"}
                          {formatMoney(t.amount)}
                        </Td>
                        <Td className="text-xs text-muted">{formatMoney(t.balanceBefore)}</Td>
                        <Td className="text-xs text-muted">{formatMoney(t.balanceAfter)}</Td>
                        <Td className="max-w-[220px] truncate text-xs text-muted">{t.description}</Td>
                        <Td className="text-xs text-muted">{formatDateTime(t.createdAt)}</Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
