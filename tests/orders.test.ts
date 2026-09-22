import { randomUUID } from "crypto";
import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/smm/db/prisma";
import { createOrder, OrderValidationError } from "@/lib/smm/orders";
import { InsufficientBalanceError } from "@/lib/smm/wallet";
import { createTestUser, createMockProviderService } from "./helpers/fixtures";

describe("createOrder", () => {
  it("charges the wallet the server-computed price and dispatches to the provider", async () => {
    const user = await createTestUser({ balance: "100.00" });
    const { service } = await createMockProviderService({ pricePer1000: "6.00", providerCost: "3.00" });

    const order = await createOrder(user.id, {
      serviceId: service.id,
      link: "https://x.com/example",
      quantity: 1000,
      idempotencyKey: randomUUID()
    });

    expect(order.sellingPrice.toFixed(2)).toBe("6.00");
    expect(order.providerCost.toFixed(2)).toBe("3.00");
    expect(order.profit.toFixed(2)).toBe("3.00");
    expect(order.status).toBe("PROCESSING");
    expect(order.providerOrderId).not.toBeNull();

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    expect(wallet.balance.toFixed(2)).toBe("94.00");
  });

  it("rejects a quantity outside the service's min/max range", async () => {
    const user = await createTestUser({ balance: "1000.00" });
    const { service } = await createMockProviderService({ minQuantity: 100, maxQuantity: 500 });

    await expect(
      createOrder(user.id, { serviceId: service.id, link: "https://x.com/a", quantity: 50, idempotencyKey: randomUUID() })
    ).rejects.toThrow(OrderValidationError);
  });

  it("rejects an order when the wallet balance is insufficient and never creates a charged order", async () => {
    const user = await createTestUser({ balance: "1.00" });
    const { service } = await createMockProviderService({ pricePer1000: "6.00" });

    await expect(
      createOrder(user.id, { serviceId: service.id, link: "https://x.com/a", quantity: 1000, idempotencyKey: randomUUID() })
    ).rejects.toThrow(InsufficientBalanceError);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    expect(wallet.balance.toFixed(2)).toBe("1.00");
    const orders = await prisma.order.findMany({ where: { userId: user.id } });
    expect(orders).toHaveLength(0);
  });

  it("refunds the wallet automatically when the provider dispatch fails", async () => {
    const user = await createTestUser({ balance: "100.00" });
    const { service } = await createMockProviderService({ pricePer1000: "6.00" });

    // MockSmmProvider.createOrder throws when the link contains "force-fail".
    const order = await createOrder(user.id, {
      serviceId: service.id,
      link: "https://x.com/force-fail",
      quantity: 1000,
      idempotencyKey: randomUUID()
    });

    expect(order.status).toBe("REFUNDED");
    expect(order.providerOrderId).toBeNull();
    expect(order.failureReason).toBeTruthy();

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    expect(wallet.balance.toFixed(2)).toBe("100.00");

    const txTypes = await prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, select: { type: true } });
    expect(txTypes.map((t) => t.type).sort()).toEqual(["PURCHASE", "REFUND"]);
  });

  it("never double-charges when the same idempotency key is submitted twice concurrently", async () => {
    const user = await createTestUser({ balance: "100.00" });
    const { service } = await createMockProviderService({ pricePer1000: "6.00" });
    const idempotencyKey = randomUUID();

    const input = { serviceId: service.id, link: "https://x.com/a", quantity: 1000, idempotencyKey };
    const [a, b] = await Promise.all([createOrder(user.id, input), createOrder(user.id, input)]);

    expect(a.id).toBe(b.id);

    const orders = await prisma.order.findMany({ where: { idempotencyKey } });
    expect(orders).toHaveLength(1);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: user.id } });
    // Charged exactly once, not twice.
    expect(wallet.balance.toFixed(2)).toBe("94.00");
  });
});
