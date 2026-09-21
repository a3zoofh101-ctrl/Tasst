import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/smm/db/prisma";
import { Card, CardContent } from "@/components/smm/ui/Card";
import { TicketThread } from "@/components/smm/dashboard/TicketThread";

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" }, include: { author: true } }, user: true }
  });
  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/admin/support" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
        <ArrowRight className="size-4" />
        العودة للدعم الفني
      </Link>
      <p className="text-sm text-muted">العميل: {ticket.user.name} ({ticket.user.email})</p>
      <Card>
        <CardContent>
          <TicketThread
            ticketId={ticket.id}
            subject={ticket.subject}
            status={ticket.status}
            currentUserIsAdmin
            messages={ticket.messages.map((m) => ({
              id: m.id,
              message: m.message,
              isAdmin: m.isAdmin,
              authorName: m.isAdmin ? "فريق الدعم" : m.author.name,
              createdAt: m.createdAt.toISOString()
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
