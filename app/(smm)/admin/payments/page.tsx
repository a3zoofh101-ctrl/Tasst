import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";

const STATUS_TONE = { PENDING: "warning", SUCCEEDED: "success", FAILED: "danger", CANCELED: "neutral" } as const;

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 150, include: { user: true } });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">المدفوعات</h1>
        <p className="mt-1 text-sm text-muted">جميع عمليات إيداع الرصيد عبر بوابات الدفع</p>
      </div>

      <Card>
        <CardContent className="!p-0">
          {payments.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا توجد مدفوعات بعد" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>العميل</Th>
                    <Th>المزود</Th>
                    <Th>المبلغ</Th>
                    <Th>المرجع</Th>
                    <Th>الحالة</Th>
                    <Th>التاريخ</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {payments.map((p) => (
                    <Tr key={p.id}>
                      <Td className="text-xs">{p.user.name}</Td>
                      <Td className="text-xs text-muted">{p.provider}</Td>
                      <Td className="font-semibold">{formatMoney(p.amount)}</Td>
                      <Td className="text-xs text-muted">{p.reference}</Td>
                      <Td>
                        <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                      </Td>
                      <Td className="text-xs text-muted">{p.createdAt.toLocaleString("ar-SA")}</Td>
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
