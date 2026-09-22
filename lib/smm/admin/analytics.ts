import "server-only";
import Decimal from "decimal.js";
import { prisma } from "@/lib/smm/db/prisma";
import type { OrderStatus } from "@prisma/client";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}
function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Orders that were actually charged (i.e. not a fully-refunded failed
// dispatch) count toward sales/cost/profit.
const CHARGED_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "IN_PROGRESS", "COMPLETED", "PARTIAL", "CANCELED"];

async function periodStats(since: Date) {
  const [agg, orderCount] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: since }, status: { in: CHARGED_STATUSES } },
      _sum: { sellingPrice: true, providerCost: true, profit: true }
    }),
    prisma.order.count({ where: { createdAt: { gte: since }, status: { in: CHARGED_STATUSES } } })
  ]);

  const sales = new Decimal(agg._sum?.sellingPrice ?? 0);
  const cost = new Decimal(agg._sum?.providerCost ?? 0);
  const profit = new Decimal(agg._sum?.profit ?? 0);

  return {
    sales: sales.toFixed(2),
    cost: cost.toFixed(2),
    profit: profit.toFixed(2),
    orderCount,
    avgOrderValue: orderCount > 0 ? sales.dividedBy(orderCount).toFixed(2) : "0.00"
  };
}

export async function getAdminOverview() {
  const [totalUsers, totalOrders, totalSalesAgg, totalCostAgg, todayOrders, pendingOrders, today, last7, last30, thisMonth] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { sellingPrice: true } }),
      prisma.order.aggregate({ _sum: { providerCost: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay(new Date()) } } }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PROCESSING", "IN_PROGRESS"] } } }),
      periodStats(startOfDay(new Date())),
      periodStats(daysAgo(7)),
      periodStats(daysAgo(30)),
      periodStats(startOfMonth())
    ]);

  const totalSales = new Decimal(totalSalesAgg._sum?.sellingPrice ?? 0);
  const totalCost = new Decimal(totalCostAgg._sum?.providerCost ?? 0);

  return {
    totalUsers,
    totalOrders,
    totalSales: totalSales.toFixed(2),
    totalProviderCost: totalCost.toFixed(2),
    grossProfit: totalSales.minus(totalCost).toFixed(2),
    todayOrders,
    pendingOrders,
    periods: { today, last7, last30, thisMonth }
  };
}
