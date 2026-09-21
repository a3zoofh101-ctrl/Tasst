import { z } from "zod";

export const createOrderSchema = z.object({
  serviceId: z.string().min(1, "اختر خدمة"),
  link: z
    .string()
    .trim()
    .min(3, "أدخل الرابط أو اسم المستخدم")
    .max(500)
    .refine((v) => !/\s/.test(v), "الرابط لا يجب أن يحتوي على فراغات"),
  quantity: z.coerce.number().int("الكمية يجب أن تكون رقمًا صحيحًا").positive("الكمية يجب أن تكون أكبر من صفر"),
  idempotencyKey: z.string().uuid("معرّف الطلب غير صالح")
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
