import "server-only";
import type { PaymentProvider } from "@/lib/smm/payments/types";
import { MockPaymentProvider } from "@/lib/smm/payments/mock";
import { MoyasarPaymentProvider } from "@/lib/smm/payments/moyasar";

// Falls back to the Mock provider until real Moyasar credentials are
// configured — safe to deploy with no payment gateway env vars set.
export function getPaymentProvider(): PaymentProvider {
  if (process.env.MOYASAR_SECRET_KEY) {
    return new MoyasarPaymentProvider();
  }
  return new MockPaymentProvider();
}
