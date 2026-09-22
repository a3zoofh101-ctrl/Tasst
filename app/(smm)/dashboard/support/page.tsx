import Link from "next/link";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { formatOrderNumber } from "@/lib/smm/orders";
import { formatDateTime } from "@/lib/smm/date";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { TicketStatusBadge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";
import { NewTicketDialog } from "@/components/smm/dashboard/NewTicketDialog";
import { LifeBuoy } from "lucide-react";

export default async function SupportPage() {
  const user = await requireUser();

  const [tickets, orders] = await Promise.all([
    prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, seq: true } })
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-fg">الدعم الفني</h1>
          <p className="mt-1 text-sm text-muted">تواصل معنا بخصوص أي مشكلة تواجهك</p>
        </div>
        <NewTicketDialog orders={orders.map((o) => ({ id: o.id, label: formatOrderNumber(o.seq) }))} />
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={LifeBuoy} title="لا توجد تذاكر دعم" description="افتح تذكرة جديدة إذا واجهت أي مشكلة" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link key={t.id} href={`/dashboard/support/${t.id}`}>
              <Card className="p-4 transition-colors hover:border-brand-400">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{t.subject}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(t.updatedAt)}</p>
                  </div>
                  <TicketStatusBadge status={t.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
