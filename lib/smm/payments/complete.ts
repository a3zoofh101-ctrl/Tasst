import "server-only";
import { prisma } from "@/lib/smm/db/prisma";
import { creditWallet } from "@/lib/smm/wallet";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";
import { getPaymentProvider } from "@/lib/smm/payments";

/**
 * Settles a PENDING redirect-based deposit (Moyasar, or any future
 * redirect-based provider). Called from both the webhook and the
 * browser-redirect callback — either can arrive first, or arrive twice,
 * so this must be idempotent and race-safe:
 *
 * - The authoritative status always comes from a fresh, secret-key
 *   authenticated call to the gateway (`verifyDeposit`), never from the
 *   webhook body or the redirect's query string.
 * - The Payment row is flipped PENDING -> SUCCEEDED with a conditional
 *   `updateMany` (only succeeds once); the wallet is only credited by
 *   whichever caller actually won that update, so a webhook/callback race
 *   can never double-credit.
 */
export async function completeRedirectDeposit(paymentReference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference: paymentReference } });
  if (!payment) return null;
  if (payment.status !== "PENDING") return payment;

  const provider = getPaymentProvider();
  if (!provider.verifyDeposit) {
    throw new Error(`Provider "${provider.name}" does not support deposit verification`);
  }

  const status = await provider.verifyDeposit(paymentReference);

  if (status === "PENDING") return payment;

  if (status === "FAILED") {
    return prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  }

  const claimed = await prisma.payment.updateMany({
    where: { id: payment.id, status: "PENDING" },
    data: { status: "SUCCEEDED" }
  });

  if (claimed.count === 0) {
    // Lost the race to another concurrent caller — they already credited it.
    return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
  }

  const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: payment.userId } });
  await creditWallet({
    walletId: wallet.id,
    type: "DEPOSIT",
    amount: payment.amount,
    reference: payment.id,
    description: `إيداع عبر ${provider.name}`
  });

  await notifyUser({
    userId: payment.userId,
    type: "WALLET_CREDITED",
    title: "تم إضافة رصيد",
    body: `تم إضافة ${payment.amount.toFixed(2)} ر.س إلى محفظتك`,
    link: "/dashboard/wallet"
  });
  await logAudit({
    actorId: payment.userId,
    action: "WALLET_DEPOSIT",
    entityType: "Payment",
    entityId: payment.id,
    metadata: { amount: payment.amount.toFixed(2), provider: provider.name }
  });

  return prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });
}
