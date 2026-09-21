"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { getOrCreateWallet, creditWallet } from "@/lib/smm/wallet";
import { getPaymentProvider } from "@/lib/smm/payments/mock";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";

const depositSchema = z.object({
  amount: z.coerce.number().positive("أدخل مبلغًا صحيحًا").max(50000, "الحد الأقصى للإيداع الواحد 50,000 ر.س")
});

export type DepositResult = { ok: true } | { ok: false; error: string };

export async function depositAction(formData: FormData): Promise<DepositResult> {
  const user = await requireUser();
  const parsed = depositSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "مبلغ غير صالح" };
  }

  const amount = new Decimal(parsed.data.amount).toDecimalPlaces(2);
  const wallet = await getOrCreateWallet(user.id);
  const provider = getPaymentProvider();

  const deposit = await provider.createDeposit({ userId: user.id, amount, currency: wallet.currency });

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      provider: provider.name,
      amount: amount.toFixed(2),
      currency: wallet.currency,
      status: deposit.status === "SUCCEEDED" ? "SUCCEEDED" : deposit.status === "FAILED" ? "FAILED" : "PENDING",
      reference: deposit.externalReference
    }
  });

  if (deposit.status !== "SUCCEEDED") {
    return { ok: false, error: "تعذّرت عملية الدفع، حاول مرة أخرى" };
  }

  await creditWallet({
    walletId: wallet.id,
    type: "DEPOSIT",
    amount,
    reference: payment.id,
    description: "إيداع رصيد"
  });

  await notifyUser({ userId: user.id, type: "WALLET_CREDITED", title: "تم إضافة رصيد", body: `تم إضافة ${amount.toFixed(2)} ر.س إلى محفظتك`, link: "/dashboard/wallet" });
  await logAudit({ actorId: user.id, action: "WALLET_DEPOSIT", entityType: "Payment", entityId: payment.id, metadata: { amount: amount.toFixed(2) } });

  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  return { ok: true };
}
