import { z } from "zod";

export const TICKET_TYPES = [
  { value: "ORDER", label: "مشكلة في طلب" },
  { value: "PAYMENT", label: "مشكلة في الدفع أو الرصيد" },
  { value: "ACCOUNT", label: "مشكلة في الحساب" },
  { value: "OTHER", label: "أخرى" }
] as const;

export const createTicketSchema = z.object({
  subject: z.string().trim().min(4, "العنوان قصير جدًا").max(150),
  type: z.enum(["ORDER", "PAYMENT", "ACCOUNT", "OTHER"]),
  orderId: z.string().optional().or(z.literal("")),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا").max(3000)
});

export const replyTicketSchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().trim().min(1, "أدخل رسالة").max(3000)
});
