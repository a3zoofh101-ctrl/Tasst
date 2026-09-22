import { describe, it, expect, afterEach } from "vitest";
import { getPaymentProvider } from "@/lib/smm/payments";
import { MockPaymentProvider } from "@/lib/smm/payments/mock";
import { MoyasarPaymentProvider } from "@/lib/smm/payments/moyasar";

describe("getPaymentProvider", () => {
  afterEach(() => {
    delete process.env.MOYASAR_SECRET_KEY;
  });

  it("falls back to the Mock provider when no Moyasar key is configured", () => {
    delete process.env.MOYASAR_SECRET_KEY;
    expect(getPaymentProvider()).toBeInstanceOf(MockPaymentProvider);
  });

  it("selects Moyasar once a secret key is configured", () => {
    process.env.MOYASAR_SECRET_KEY = "sk_test_dummy";
    expect(getPaymentProvider()).toBeInstanceOf(MoyasarPaymentProvider);
  });
});

describe("MockPaymentProvider", () => {
  it("always succeeds synchronously with a unique reference", async () => {
    const provider = new MockPaymentProvider();
    const [a, b] = await Promise.all([provider.createDeposit(), provider.createDeposit()]);
    expect(a.status).toBe("SUCCEEDED");
    expect(a.externalReference).not.toBe(b.externalReference);
  });
});
