import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
  .regex(/[a-zA-Z]/, "يجب أن تحتوي كلمة المرور على حرف واحد على الأقل")
  .regex(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "الاسم قصير جدًا").max(100),
    email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح"),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{8,15}$/, "رقم جوال غير صالح")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"]
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "أدخل كلمة المرور")
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح")
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"]
  });
