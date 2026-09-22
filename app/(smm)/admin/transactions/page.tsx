import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney } from "@/lib/smm/money";
import { formatDateTime } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";

const TX_TONE = { DEPOSIT: "success", PURCHASE: "danger", REFUND: "brand", ADMIN_CREDIT: "success", ADMIN_DEBIT: "danger" } as const;

export default async function AdminTransactionsPage() {
  const transactions = await prisma.walletTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { wallet: { include: { user: true } } }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">المعاملات المالية</h1>
        <p className="mt-1 text-sm text-muted">سجل كامل لحركة المحافظ عبر المنصة</p>
      </div>

      <Card>
        <CardContent className="!p-0">
          {transactions.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد معاملات بعد" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>العميل</Th>
                    <Th>النوع</Th>
                    <Th>المبلغ</Th>
                    <Th>الرصيد بعد</Th>
                    <Th>الوصف</Th>
                    <Th>التاريخ</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {transactions.map((t) => (
                    <Tr key={t.id}>
                      <Td className="text-xs">{t.wallet.user.name}</Td>
                      <Td>
                        <Badge tone={TX_TONE[t.type]}>{t.type}</Badge>
                      </Td>
                      <Td className="font-semibold">{formatMoney(t.amount)}</Td>
                      <Td className="text-xs text-muted">{formatMoney(t.balanceAfter)}</Td>
                      <Td className="max-w-[220px] truncate text-xs text-muted">{t.description}</Td>
                      <Td className="text-xs text-muted">{formatDateTime(t.createdAt)}</Td>
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
