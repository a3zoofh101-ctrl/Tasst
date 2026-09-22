import "server-only";
import { Prisma, type WalletTxType } from "@prisma/client";
import Decimal from "decimal.js";
import { prisma } from "@/lib/smm/db/prisma";

export class InsufficientBalanceError extends Error {
  constructor() {
    super("رصيد غير كافٍ لإتمام العملية");
    this.name = "InsufficientBalanceError";
  }
}

type Db = Prisma.TransactionClient | typeof prisma;

const DEBIT_TYPES: WalletTxType[] = ["PURCHASE", "ADMIN_DEBIT"];

/**
 * Every wallet mutation goes through this function. Debits use a
 * conditional `UPDATE ... WHERE balance >= amount` so concurrent requests
 * (e.g. two orders placed at once) can never push the balance negative —
 * the row-level lock Postgres takes for the UPDATE serializes concurrent
 * callers, and the losing caller's WHERE clause simply matches zero rows.
 */
export async function applyWalletTransaction(
  db: Db,
  params: {
    walletId: string;
    type: WalletTxType;
    amount: Decimal.Value;
    reference?: string;
    description?: string;
  }
) {
  const amount = new Decimal(params.amount);
  if (amount.lessThanOrEqualTo(0)) {
    throw new Error("Wallet transaction amount must be positive");
  }
  const amountStr = amount.toFixed(2);
  const isDebit = DEBIT_TYPES.includes(params.type);

  const rows = isDebit
    ? await db.$queryRaw<{ balance: Prisma.Decimal }[]>`
        UPDATE "Wallet" SET balance = balance - ${amountStr}::numeric, "updatedAt" = now()
        WHERE id = ${params.walletId} AND balance >= ${amountStr}::numeric
        RETURNING balance
      `
    : await db.$queryRaw<{ balance: Prisma.Decimal }[]>`
        UPDATE "Wallet" SET balance = balance + ${amountStr}::numeric, "updatedAt" = now()
        WHERE id = ${params.walletId}
        RETURNING balance
      `;

  if (rows.length === 0) {
    throw new InsufficientBalanceError();
  }

  const balanceAfter = new Decimal(rows[0].balance.toString());
  const balanceBefore = isDebit ? balanceAfter.plus(amountStr) : balanceAfter.minus(amountStr);

  return db.walletTransaction.create({
    data: {
      walletId: params.walletId,
      type: params.type,
      amount: amountStr,
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      reference: params.reference,
      description: params.description
    }
  });
}

export async function getOrCreateWallet(userId: string) {
  const existing = await prisma.wallet.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.wallet.create({ data: { userId, balance: 0 } });
}

export async function creditWallet(params: {
  walletId: string;
  type: Extract<WalletTxType, "DEPOSIT" | "REFUND" | "ADMIN_CREDIT">;
  amount: Decimal.Value;
  reference?: string;
  description?: string;
}) {
  return prisma.$transaction((tx) => applyWalletTransaction(tx, params));
}

export async function debitWallet(params: {
  walletId: string;
  type: Extract<WalletTxType, "PURCHASE" | "ADMIN_DEBIT">;
  amount: Decimal.Value;
  reference?: string;
  description?: string;
}) {
  return prisma.$transaction((tx) => applyWalletTransaction(tx, params));
}
