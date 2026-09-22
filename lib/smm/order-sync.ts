import "server-only";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/smm/db/prisma";
import { getProviderAdapter } from "@/lib/smm/providers/factory";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";

const ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS"];

export async function findOrdersDueForSync(limit = 50) {
  return prisma.order.findMany({
    where: { status: { in: ACTIVE_STATUSES }, providerOrderId: { not: null } },
    orderBy: { updatedAt: "asc" },
    take: limit,
    include: { provider: true }
  });
}

export async function syncOrderStatus(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { provider: true } });
  if (!order || !order.providerOrderId) return null;

  const adapter = getProviderAdapter(order.provider);
  const result = await adapter.getOrderStatus(order.providerOrderId);

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: result.status,
      startCount: result.startCount ?? order.startCount,
      remains: result.remains ?? order.remains
    }
  });

  if (order.status !== "COMPLETED" && result.status === "COMPLETED") {
    await notifyUser({
      userId: order.userId,
      type: "ORDER_COMPLETED",
      title: "تم تنفيذ طلبك",
      body: `اكتمل تنفيذ طلبك رقم ${order.seq}`,
      link: `/dashboard/orders/${order.id}`
    });
    await logAudit({ action: "ORDER_COMPLETED", entityType: "Order", entityId: order.id });
  }

  return updated;
}
