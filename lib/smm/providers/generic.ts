import type {
  ProviderOrderStatus,
  ProviderServiceDto,
  SmmProviderAdapter
} from "@/lib/smm/providers/types";
import { ProviderApiError } from "@/lib/smm/providers/types";

// Adapter for the classic single-endpoint SMM API shape used by many
// providers: POST { key, action, ...params } -> JSON. Field names vary
// between providers, so this class centralizes the request/response
// mapping in one place — adjust the `map*` helpers per-provider if a
// specific provider deviates from this shape.
export class GenericSmmProvider implements SmmProviderAdapter {
  constructor(private readonly apiUrl: string, private readonly apiKey: string) {}

  private async post<T>(action: string, params: Record<string, string | number> = {}): Promise<T> {
    const body = new URLSearchParams({ key: this.apiKey, action, ...toStringRecord(params) });

    let response: Response;
    try {
      response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        cache: "no-store"
      });
    } catch (err) {
      throw new ProviderApiError("تعذّر الاتصال بالمزود", err);
    }

    if (!response.ok) {
      throw new ProviderApiError(`استجابة غير متوقعة من المزود (HTTP ${response.status})`);
    }

    const data = await response.json().catch(() => {
      throw new ProviderApiError("استجابة غير صالحة من المزود");
    });

    if (data && typeof data === "object" && "error" in data && data.error) {
      throw new ProviderApiError(String((data as { error: unknown }).error));
    }

    return data as T;
  }

  async getServices(): Promise<ProviderServiceDto[]> {
    const data = await this.post<unknown[]>("services");
    if (!Array.isArray(data)) throw new ProviderApiError("صيغة قائمة الخدمات غير متوقعة");

    return data.map((raw) => {
      const s = raw as Record<string, unknown>;
      return {
        providerServiceId: String(s.service ?? s.id ?? ""),
        name: String(s.name ?? ""),
        category: s.category ? String(s.category) : undefined,
        rate: String(s.rate ?? "0"),
        minQuantity: Number(s.min ?? 0),
        maxQuantity: Number(s.max ?? 0),
        refill: Boolean(s.refill),
        cancelSupported: Boolean(s.cancel),
        averageTime: s.average_time ? String(s.average_time) : undefined,
        raw
      };
    });
  }

  async getBalance(): Promise<string> {
    const data = await this.post<{ balance?: string | number }>("balance");
    return String(data.balance ?? "0");
  }

  async createOrder(params: { serviceId: string; link: string; quantity: number }) {
    const data = await this.post<{ order?: string | number }>("add", {
      service: params.serviceId,
      link: params.link,
      quantity: params.quantity
    });
    if (!data.order) throw new ProviderApiError("لم يُرجع المزود رقم طلب");
    return { providerOrderId: String(data.order) };
  }

  async getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus> {
    const data = await this.post<{ status?: string; start_count?: string; remains?: string }>("status", {
      order: providerOrderId
    });
    return {
      status: mapStatus(data.status),
      startCount: data.start_count != null ? Number(data.start_count) : null,
      remains: data.remains != null ? Number(data.remains) : null
    };
  }

  async refillOrder(providerOrderId: string) {
    const data = await this.post<{ refill?: string | number }>("refill", { order: providerOrderId });
    return data.refill ? { refillId: String(data.refill) } : null;
  }

  async cancelOrder(providerOrderId: string): Promise<boolean> {
    const data = await this.post<{ cancel?: string }>("cancel", { order: providerOrderId });
    return data.cancel !== undefined;
  }
}

function toStringRecord(params: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]));
}

function mapStatus(raw?: string): ProviderOrderStatus["status"] {
  switch ((raw ?? "").toLowerCase()) {
    case "completed":
      return "COMPLETED";
    case "partial":
      return "PARTIAL";
    case "canceled":
    case "cancelled":
      return "CANCELED";
    case "processing":
      return "PROCESSING";
    case "in progress":
    case "inprogress":
      return "IN_PROGRESS";
    default:
      return "PENDING";
  }
}
