"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/smm/auth/session";
import { createOrder, OrderValidationError } from "@/lib/smm/orders";
import { InsufficientBalanceError } from "@/lib/smm/wallet";
import { createOrderSchema } from "@/lib/smm/validation/order";

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

export async function createOrderAction(formData: FormData): Promise<CreateOrderResult> {
  const user = await requireUser();

  const parsed = createOrderSchema.safeParse({
    serviceId: formData.get("serviceId"),
    link: formData.get("link"),
    quantity: formData.get("quantity"),
    idempotencyKey: formData.get("idempotencyKey")
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    const order = await createOrder(user.id, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/wallet");
    return { ok: true, orderId: order.id };
  } catch (err) {
    if (err instanceof InsufficientBalanceError) return { ok: false, error: err.message };
    if (err instanceof OrderValidationError) return { ok: false, error: err.message };
    console.error("createOrderAction failed", err);
    return { ok: false, error: "تعذّر إنشاء الطلب، حاول مرة أخرى" };
  }
}
