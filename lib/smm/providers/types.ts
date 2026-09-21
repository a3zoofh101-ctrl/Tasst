// Unified adapter every SMM provider integration must implement. The rest
// of the app (order creation, cron sync, admin sync) only ever talks to
// this interface, never to a provider's raw HTTP API directly.

export type ProviderServiceDto = {
  providerServiceId: string;
  name: string;
  category?: string;
  rate: string; // cost per 1000, decimal string
  minQuantity: number;
  maxQuantity: number;
  refill?: boolean;
  cancelSupported?: boolean;
  averageTime?: string;
  raw?: unknown;
};

export type ProviderOrderResult = {
  providerOrderId: string;
};

export type ProviderOrderStatus = {
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "PARTIAL" | "CANCELED" | "PROCESSING";
  startCount?: number | null;
  remains?: number | null;
};

export class ProviderApiError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ProviderApiError";
  }
}

export interface SmmProviderAdapter {
  getServices(): Promise<ProviderServiceDto[]>;
  getBalance(): Promise<string>;
  createOrder(params: { serviceId: string; link: string; quantity: number }): Promise<ProviderOrderResult>;
  getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus>;
  refillOrder(providerOrderId: string): Promise<{ refillId: string } | null>;
  cancelOrder(providerOrderId: string): Promise<boolean>;
}
