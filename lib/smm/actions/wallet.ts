"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import Decimal from "decimal.js";
import { requireUser } from "@/lib/smm/auth/session";
import { prisma } from "@/lib/smm/db/prisma";
import { getOrCreateWallet, creditWallet } from "@/lib/smm/wallet";
import { getPaymentProvider } from "@/lib/smm/payments";
import { notifyUser } from "@/lib/smm/notify";
import { logAudit } from "@/lib/smm/audit";
import { getSettings } from "@/lib/smm/settings";

const depositSchema = z.object({
  amount: z.coerce.number().positive("أدخل مبلغًا صحيحًا")
});

export type DepositResult = { ok: true; redirectUrl?: string } | { ok: false; error: string };

export async function depositAction(formData: FormData): Promise<DepositResult> {
  const user = await requireUser();
  const parsed = depositSchema.safeParse({ amount: formData.get("amount") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "مبلغ غير صالح" };
  }

  const { minDepositAmount, maxDepositAmount } = await getSettings();
  const min = Number(minDepositAmount);
  const max = Number(maxDepositAmount);
  if (parsed.data.amount < min) {
    return { ok: false, error: `الحد الأدنى للإيداع ${min} ر.س` };
  }
  if (parsed.data.amount > max) {
    return { ok: false, error: `الحد الأقصى للإيداع الواحد ${max} ر.س` };
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

  if (deposit.status === "FAILED") {
    return { ok: false, error: "تعذّرت عملية الدفع، حاول مرة أخرى" };
  }

  if (deposit.status === "PENDING") {
    // Redirect-based provider (e.g. Moyasar/Mada): the wallet is credited
    // later, from the webhook or callback route, once the gateway
    // confirms the charge actually succeeded — never here.
    if (!deposit.redirectUrl) {
      return { ok: false, error: "تعذّر بدء عملية الدفع" };
    }
    return { ok: true, redirectUrl: deposit.redirectUrl };
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
