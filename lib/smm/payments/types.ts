import type Decimal from "decimal.js";

export type DepositResult = {
  externalReference: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  redirectUrl?: string;
};

// Every payment gateway integration (Mada/Apple Pay/Visa/Mastercard via a
// licensed Saudi payment provider, etc.) implements this. The app never
// stores card data — a real implementation only ever handles a redirect
// or a server-to-server webhook confirming the gateway's own tokenized charge.
export interface PaymentProvider {
  readonly name: string;
  createDeposit(params: { userId: string; amount: Decimal; currency: string }): Promise<DepositResult>;
  /**
   * Re-checks a deposit's authoritative status directly against the
   * gateway's own API. Required for any redirect/webhook-based provider
   * (createDeposit returns PENDING) — callers must never trust a webhook
   * payload or a redirect query string on its own, only this.
   */
  verifyDeposit?(externalReference: string): Promise<"SUCCEEDED" | "FAILED" | "PENDING">;
}
