import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { formatMoney } from "@/lib/smm/money";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { Badge } from "@/components/smm/ui/Badge";
import { Input } from "@/components/smm/ui/Input";
import { Table, Thead, Tr, Th, Td } from "@/components/smm/ui/Table";
import { EmptyState } from "@/components/smm/ui/States";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { wallet: true, _count: { select: { orders: true } } }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">المستخدمون</h1>
        <p className="mt-1 text-sm text-muted">بحث وإدارة حسابات العملاء</p>
      </div>

      <form className="max-w-sm">
        <Input name="q" defaultValue={q} placeholder="ابحث بالاسم أو البريد الإلكتروني..." />
      </form>

      <Card>
        <CardContent className="!p-0">
          {users.length === 0 ? (
            <div className="p-5">
              <EmptyState title="لا يوجد مستخدمون" />
            </div>
          ) : (
            <div className="p-5">
              <Table>
                <Thead>
                  <Tr>
                    <Th>الاسم</Th>
                    <Th>البريد الإلكتروني</Th>
                    <Th>الرصيد</Th>
                    <Th>عدد الطلبات</Th>
                    <Th>الحالة</Th>
                    <Th>تاريخ التسجيل</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {users.map((u) => (
                    <Tr key={u.id}>
                      <Td>
                        <Link href={`/admin/users/${u.id}`} className="font-semibold text-brand-600 hover:underline">
                          {u.name}
                        </Link>
                      </Td>
                      <Td className="text-xs text-muted">{u.email}</Td>
                      <Td>{formatMoney(u.wallet?.balance ?? 0)}</Td>
                      <Td>{u._count.orders}</Td>
                      <Td>
                        <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "نشط" : "معطّل"}</Badge>
                      </Td>
                      <Td className="text-xs text-muted">{u.createdAt.toLocaleDateString("ar-SA")}</Td>
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
