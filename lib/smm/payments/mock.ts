import { randomUUID } from "crypto";
import type { PaymentProvider, DepositResult } from "@/lib/smm/payments/types";

// Stands in for a real gateway during development/testing. Always
// succeeds synchronously. See lib/smm/payments/index.ts for how a real
// redirect-based provider (e.g. MoyasarPaymentProvider) is selected once
// credentials exist.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createDeposit(): Promise<DepositResult> {
    return { externalReference: `MOCKPAY-${randomUUID().slice(0, 10).toUpperCase()}`, status: "SUCCEEDED" };
  }
}
