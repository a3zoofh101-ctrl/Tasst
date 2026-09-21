import Link from "next/link";
import { prisma } from "@/lib/smm/db/prisma";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { TicketStatusBadge } from "@/components/smm/ui/Badge";
import { EmptyState } from "@/components/smm/ui/States";

export default async function AdminSupportPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 150,
    include: { user: true }
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-fg">الدعم الفني</h1>
        <p className="mt-1 text-sm text-muted">تذاكر الدعم الواردة من العملاء</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState title="لا توجد تذاكر دعم" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link key={t.id} href={`/admin/support/${t.id}`}>
              <Card className="p-4 transition-colors hover:border-brand-400">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{t.subject}</p>
                    <p className="mt-1 text-xs text-muted">
                      {t.user.name} · {t.updatedAt.toLocaleString("ar-SA")}
                    </p>
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
