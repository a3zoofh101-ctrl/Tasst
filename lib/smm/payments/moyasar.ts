import type Decimal from "decimal.js";
import type { PaymentProvider, DepositResult } from "@/lib/smm/payments/types";

// Moyasar (https://moyasar.com) is a SAMA-licensed Saudi payment gateway
// supporting Mada, Visa, Mastercard and Apple Pay. This uses its hosted
// "Invoices" API: we never see card data — the customer enters it on
// Moyasar's own hosted page after being redirected there.
//
// Sandbox: use a `sk_test_...` secret key from the Moyasar dashboard and
// test cards from https://docs.moyasar.com/testing. Nothing here is
// reachable until MOYASAR_SECRET_KEY is set — see lib/smm/payments/index.ts.
const MOYASAR_API_BASE = "https://api.moyasar.com/v1";

type MoyasarInvoice = {
  id: string;
  status: string; // "initiated" | "paid" | "failed" | "canceled" | "expired" | ...
  url: string;
};

export class MoyasarPaymentProvider implements PaymentProvider {
  readonly name = "moyasar";

  private authHeader(): string {
    const key = process.env.MOYASAR_SECRET_KEY;
    if (!key) throw new Error("MOYASAR_SECRET_KEY is not set");
    return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
  }

  async createDeposit(params: { userId: string; amount: Decimal; currency: string }): Promise<DepositResult> {
    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL must be set to build the Moyasar callback_url");

    const response = await fetch(`${MOYASAR_API_BASE}/invoices`, {
      method: "POST",
      headers: { Authorization: this.authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        // Moyasar expects the smallest currency unit (halalas for SAR).
        amount: params.amount.times(100).toNumber(),
        currency: params.currency,
        description: `إيداع رصيد - بوست`,
        callback_url: `${appUrl}/api/payments/moyasar/callback`,
        metadata: { userId: params.userId }
      })
    });

    if (!response.ok) {
      throw new Error(`Moyasar invoice creation failed (HTTP ${response.status})`);
    }

    const invoice = (await response.json()) as MoyasarInvoice;
    return { externalReference: invoice.id, status: "PENDING", redirectUrl: invoice.url };
  }

  async verifyDeposit(externalReference: string): Promise<"SUCCEEDED" | "FAILED" | "PENDING"> {
    const response = await fetch(`${MOYASAR_API_BASE}/invoices/${externalReference}`, {
      headers: { Authorization: this.authHeader() },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Moyasar invoice lookup failed (HTTP ${response.status})`);
    }

    const invoice = (await response.json()) as MoyasarInvoice;
    if (invoice.status === "paid") return "SUCCEEDED";
    if (["failed", "canceled", "expired", "refunded", "voided"].includes(invoice.status)) return "FAILED";
    return "PENDING";
  }
}
