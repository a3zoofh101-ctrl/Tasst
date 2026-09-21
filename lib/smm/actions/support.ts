"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { notifyUser } from "@/lib/smm/notify";
import { createTicketSchema, replyTicketSchema } from "@/lib/smm/validation/support";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTicketAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = createTicketSchema.safeParse({
    subject: formData.get("subject"),
    type: formData.get("type"),
    orderId: formData.get("orderId"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: parsed.data.subject,
      type: parsed.data.type,
      orderId: parsed.data.orderId || null,
      status: "OPEN",
      messages: {
        create: { authorId: user.id, isAdmin: false, message: parsed.data.message }
      }
    }
  });

  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${ticket.id}`);
}

export async function replyTicketAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = replyTicketSchema.safeParse({
    ticketId: formData.get("ticketId"),
    message: formData.get("message")
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const ticket = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return { ok: false, error: "التذكرة غير موجودة" };

  const isAdmin = user.role === "ADMIN";
  if (!isAdmin && ticket.userId !== user.id) return { ok: false, error: "غير مصرح" };
  if (ticket.status === "CLOSED") return { ok: false, error: "هذه التذكرة مغلقة" };

  await prisma.$transaction([
    prisma.supportMessage.create({
      data: { ticketId: ticket.id, authorId: user.id, isAdmin, message: parsed.data.message }
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: isAdmin ? "ANSWERED" : "OPEN" }
    })
  ]);

  if (isAdmin) {
    await notifyUser({
      userId: ticket.userId,
      type: "SUPPORT_REPLY",
      title: "رد الدعم على تذكرتك",
      body: parsed.data.message.slice(0, 120),
      link: `/dashboard/support/${ticket.id}`
    });
  }

  revalidatePath(`/dashboard/support/${ticket.id}`);
  revalidatePath(`/admin/support/${ticket.id}`);
  return { ok: true };
}

export async function closeTicketAction(ticketId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "غير مصرح" };

  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return { ok: false, error: "التذكرة غير موجودة" };
  if (user.role !== "ADMIN" && ticket.userId !== user.id) return { ok: false, error: "غير مصرح" };

  await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "CLOSED" } });
  revalidatePath(`/dashboard/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { ok: true };
}
