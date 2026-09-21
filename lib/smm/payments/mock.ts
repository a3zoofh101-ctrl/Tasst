import { randomUUID } from "crypto";
import type { PaymentProvider, DepositResult } from "@/lib/smm/payments/types";

// Stands in for a real gateway during development/testing. Always
// succeeds synchronously — swap in a real PaymentProvider implementation
// (e.g. a Mada/Visa/Mastercard-capable Saudi PSP) once credentials exist.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createDeposit(): Promise<DepositResult> {
    return { externalReference: `MOCKPAY-${randomUUID().slice(0, 10).toUpperCase()}`, status: "SUCCEEDED" };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}
