import { describe, it, expect } from "vitest";
import { prisma } from "@/lib/smm/db/prisma";
import { creditWallet, debitWallet, InsufficientBalanceError } from "@/lib/smm/wallet";
import { createTestUser } from "./helpers/fixtures";

describe("wallet transactions", () => {
  it("credits the wallet and logs a transaction with correct before/after balance", async () => {
    const user = await createTestUser({ balance: "10.00" });
    await creditWallet({ walletId: user.wallet!.id, type: "DEPOSIT", amount: "25.00", description: "test deposit" });

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id: user.wallet!.id } });
    expect(wallet.balance.toFixed(2)).toBe("35.00");

    const tx = await prisma.walletTransaction.findFirstOrThrow({ where: { walletId: wallet.id, type: "DEPOSIT" } });
    expect(tx.balanceBefore.toFixed(2)).toBe("10.00");
    expect(tx.balanceAfter.toFixed(2)).toBe("35.00");
  });

  it("debits the wallet when balance is sufficient", async () => {
    const user = await createTestUser({ balance: "50.00" });
    await debitWallet({ walletId: user.wallet!.id, type: "PURCHASE", amount: "20.00", description: "test purchase" });

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id: user.wallet!.id } });
    expect(wallet.balance.toFixed(2)).toBe("30.00");
  });

  it("rejects a debit larger than the balance and leaves the balance unchanged", async () => {
    const user = await createTestUser({ balance: "10.00" });

    await expect(
      debitWallet({ walletId: user.wallet!.id, type: "PURCHASE", amount: "50.00", description: "too much" })
    ).rejects.toThrow(InsufficientBalanceError);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id: user.wallet!.id } });
    expect(wallet.balance.toFixed(2)).toBe("10.00");
  });

  it("never allows the balance to go negative under concurrent debits", async () => {
    // Simulates two near-simultaneous order submissions against a wallet
    // that can only afford one of them.
    const user = await createTestUser({ balance: "10.00" });

    const results = await Promise.allSettled([
      debitWallet({ walletId: user.wallet!.id, type: "PURCHASE", amount: "8.00", description: "order A" }),
      debitWallet({ walletId: user.wallet!.id, type: "PURCHASE", amount: "8.00", description: "order B" })
    ]);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");
    expect(succeeded).toHaveLength(1);
    expect(failed).toHaveLength(1);

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { id: user.wallet!.id } });
    expect(wallet.balance.toFixed(2)).toBe("2.00");
    expect(Number(wallet.balance)).toBeGreaterThanOrEqual(0);
  });
});
