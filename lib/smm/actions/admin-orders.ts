"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { applyWalletTransaction, getOrCreateWallet, InsufficientBalanceError } from "@/lib/smm/wallet";
import { getProviderAdapter } from "@/lib/smm/providers/factory";
import { ProviderApiError } from "@/lib/smm/providers/types";
import { syncOrderStatus } from "@/lib/smm/order-sync";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function adminQueryOrderStatusAction(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const updated = await syncOrderStatus(orderId);
    if (!updated) return { ok: false, error: "لا يمكن الاستعلام عن حالة هذا الطلب" };
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ProviderApiError ? err.message : "تعذّر الاستعلام عن حالة الطلب" };
  }
}

// Retries dispatch for an order whose initial send to the provider failed
// (auto-refunded, providerOrderId still null). Re-charges the wallet only
// if the retry is actually attempted — never twice for the same attempt.
export async function adminRetryOrderAction(orderId: string): Promise<ActionResult> {
  const admin = await requireAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { service: true, provider: true } });
  if (!order) return { ok: false, error: "الطلب غير موجود" };
  if (order.status !== "REFUNDED" || order.providerOrderId) {
    return { ok: false, error: "لا يمكن إعادة المحاولة إلا للطلبات التي فشل إرسالها" };
  }

  const wallet = await getOrCreateWallet(order.userId);

  try {
    await prisma.$transaction(async (tx) => {
      await applyWalletTransaction(tx, {
        walletId: wallet.id,
        type: "PURCHASE",
        amount: order.sellingPrice,
        reference: `retry:${order.id}`,
        description: `إعادة محاولة إرسال الطلب: ${order.service.name}`
      });
      await tx.order.update({ where: { id: order.id }, data: { status: "PENDING", failureReason: null } });
    });
  } catch (err) {
    if (err instanceof InsufficientBalanceError) return { ok: false, error: "رصيد العميل غير كافٍ لإعادة المحاولة" };
    throw err;
  }

  try {
    const adapter = getProviderAdapter(order.provider);
    const result = await adapter.createOrder({ serviceId: order.service.providerRefId, link: order.link, quantity: order.quantity });
    await prisma.order.update({ where: { id: order.id }, data: { providerOrderId: result.providerOrderId, status: "PROCESSING" } });
    await logAudit({ actorId: admin.id, action: "ORDER_RETRY_SUCCEEDED", entityType: "Order", entityId: order.id });
  } catch (err) {
    const reason = err instanceof ProviderApiError ? err.message : "تعذّر إرسال الطلب إلى المزود";
    await prisma.$transaction(async (tx) => {
      await applyWalletTransaction(tx, {
        walletId: wallet.id,
        type: "REFUND",
        amount: order.sellingPrice,
        reference: `retry-refund:${order.id}`,
        description: "استرجاع بعد فشل إعادة المحاولة"
      });
      await tx.order.update({ where: { id: order.id }, data: { status: "REFUNDED", failureReason: reason } });
    });
    await logAudit({ actorId: admin.id, action: "ORDER_RETRY_FAILED", entityType: "Order", entityId: order.id, metadata: { reason } });
    revalidatePath(`/admin/orders/${orderId}`);
    return { ok: false, error: reason };
  }

  await notifyUser({ userId: order.userId, type: "ORDER_RECEIVED", title: "تمت إعادة إرسال طلبك", link: `/dashboard/orders/${order.id}` });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}
