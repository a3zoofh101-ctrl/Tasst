import "server-only";
import { Prisma } from "@prisma/client";
import type Decimal from "decimal.js";
import { prisma } from "@/lib/smm/db/prisma";
import { applyWalletTransaction, getOrCreateWallet } from "@/lib/smm/wallet";
import { calcOrderTotal } from "@/lib/smm/money";
import { getProviderAdapter } from "@/lib/smm/providers/factory";
import { ProviderApiError } from "@/lib/smm/providers/types";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";

export class OrderValidationError extends Error {}

export function formatOrderNumber(seq: number): string {
  return `ORD-${String(seq).padStart(6, "0")}`;
}

export async function createOrder(
  userId: string,
  input: { serviceId: string; link: string; quantity: number; idempotencyKey: string }
) {
  // Idempotent replay: a duplicate submit (double-click, retried request)
  // with the same key returns the original order instead of charging again.
  const existing = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) {
    if (existing.userId !== userId) throw new OrderValidationError("طلب غير صالح");
    return existing;
  }

  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { provider: true }
  });

  if (!service || !service.active || !service.provider.active) {
    throw new OrderValidationError("هذه الخدمة غير متاحة حاليًا");
  }
  if (input.quantity < service.minQuantity || input.quantity > service.maxQuantity) {
    throw new OrderValidationError(`الكمية يجب أن تكون بين ${service.minQuantity} و ${service.maxQuantity}`);
  }

  // Price is always computed server-side from the DB record — never trust
  // a price the client might have sent.
  const sellingPrice = calcOrderTotal(input.quantity, service.pricePer1000);
  const providerCost = calcOrderTotal(input.quantity, service.providerCost);
  const profit = sellingPrice.minus(providerCost);

  const wallet = await getOrCreateWallet(userId);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      await applyWalletTransaction(tx, {
        walletId: wallet.id,
        type: "PURCHASE",
        amount: sellingPrice,
        reference: input.idempotencyKey,
        description: `شراء خدمة: ${service.name}`
      });

      return tx.order.create({
        data: {
          userId,
          serviceId: service.id,
          providerId: service.providerId,
          link: input.link,
          quantity: input.quantity,
          sellingPrice: sellingPrice.toFixed(2),
          providerCost: providerCost.toFixed(2),
          profit: profit.toFixed(2),
          status: "PENDING",
          idempotencyKey: input.idempotencyKey
        }
      });
    });
  } catch (err) {
    // Two concurrent submits with the same idempotency key: the loser's
    // whole transaction (including its wallet debit) rolled back — it was
    // never charged. Return the winner's order instead of erroring.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const raced = await prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (raced) return raced;
    }
    throw err;
  }

  await notifyUser({
    userId,
    type: "ORDER_RECEIVED",
    title: "تم استلام طلبك",
    body: `${service.name} × ${input.quantity}`,
    link: `/dashboard/orders/${order.id}`
  });
  await logAudit({
    actorId: userId,
    action: "ORDER_CREATED",
    entityType: "Order",
    entityId: order.id,
    metadata: { sellingPrice: sellingPrice.toFixed(2) }
  });

  // Provider dispatch happens outside the DB transaction — it's network
  // I/O and must never hold a DB transaction (and its row locks) open.
  try {
    const adapter = getProviderAdapter(service.provider);
    const result = await adapter.createOrder({
      serviceId: service.providerRefId,
      link: input.link,
      quantity: input.quantity
    });

    order = await prisma.order.update({
      where: { id: order.id },
      data: { providerOrderId: result.providerOrderId, status: "PROCESSING" }
    });
  } catch (err) {
    order = await rollbackFailedOrder({ orderId: order.id, userId, walletId: wallet.id, sellingPrice, err });
  }

  return order;
}

async function rollbackFailedOrder(params: {
  orderId: string;
  userId: string;
  walletId: string;
  sellingPrice: Decimal;
  err: unknown;
}) {
  const reason = params.err instanceof ProviderApiError ? params.err.message : "تعذّر إرسال الطلب إلى المزود";

  const order = await prisma.$transaction(async (tx) => {
    await applyWalletTransaction(tx, {
      walletId: params.walletId,
      type: "REFUND",
      amount: params.sellingPrice,
      reference: params.orderId,
      description: "استرجاع بسبب فشل إرسال الطلب إلى المزود"
    });

    return tx.order.update({
      where: { id: params.orderId },
      data: { status: "REFUNDED", failureReason: reason }
    });
  });

  await notifyUser({
    userId: params.userId,
    type: "ORDER_REFUNDED",
    title: "تمت إعادة المبلغ إلى محفظتك",
    body: reason,
    link: `/dashboard/orders/${params.orderId}`
  });
  await logAudit({
    actorId: params.userId,
    action: "ORDER_PROVIDER_FAILED",
    entityType: "Order",
    entityId: params.orderId,
    metadata: { reason }
  });

  return order;
}
