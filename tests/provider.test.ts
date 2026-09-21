import { describe, it, expect } from "vitest";
import { MockSmmProvider } from "@/lib/smm/providers/mock";
import { ProviderApiError } from "@/lib/smm/providers/types";

describe("MockSmmProvider", () => {
  const provider = new MockSmmProvider();

  it("returns a non-empty service catalog", async () => {
    const services = await provider.getServices();
    expect(services.length).toBeGreaterThan(0);
    expect(services[0]).toHaveProperty("providerServiceId");
  });

  it("returns a balance", async () => {
    expect(await provider.getBalance()).toBeTruthy();
  });

  it("throws ProviderApiError when the link signals a forced failure", async () => {
    await expect(provider.createOrder({ serviceId: "mock-tw-followers", link: "https://x.com/force-fail", quantity: 100 })).rejects.toThrow(
      ProviderApiError
    );
  });

  it("creates an order and reports a valid status for it", async () => {
    const { providerOrderId } = await provider.createOrder({ serviceId: "mock-tw-followers", link: "https://x.com/ok", quantity: 500 });
    const status = await provider.getOrderStatus(providerOrderId);
    expect(["PENDING", "IN_PROGRESS", "PARTIAL", "COMPLETED"]).toContain(status.status);
  });

  it("rejects status lookups for an unknown order id", async () => {
    await expect(provider.getOrderStatus("not-a-real-id")).rejects.toThrow(ProviderApiError);
  });
});
