import { randomUUID } from "crypto";
import type {
  ProviderOrderStatus,
  ProviderServiceDto,
  SmmProviderAdapter
} from "@/lib/smm/providers/types";
import { ProviderApiError } from "@/lib/smm/providers/types";

const MOCK_CATALOG: ProviderServiceDto[] = [
  { providerServiceId: "mock-tw-followers", name: "متابعون X (تويتر)", category: "متابعون", rate: "3.5000", minQuantity: 100, maxQuantity: 50000, refill: true, cancelSupported: true, averageTime: "0-6 ساعات" },
  { providerServiceId: "mock-tw-likes", name: "إعجابات X (تويتر)", category: "تفاعل", rate: "1.2000", minQuantity: 50, maxQuantity: 100000, refill: false, cancelSupported: true, averageTime: "0-1 ساعة" },
  { providerServiceId: "mock-ig-followers", name: "متابعون إنستغرام", category: "متابعون", rate: "4.0000", minQuantity: 100, maxQuantity: 100000, refill: true, cancelSupported: true, averageTime: "0-12 ساعة" },
  { providerServiceId: "mock-ig-likes", name: "إعجابات إنستغرام", category: "تفاعل", rate: "1.0000", minQuantity: 50, maxQuantity: 50000, refill: false, cancelSupported: false, averageTime: "0-30 دقيقة" },
  { providerServiceId: "mock-ig-views", name: "مشاهدات ريلز إنستغرام", category: "مشاهدات", rate: "0.3000", minQuantity: 500, maxQuantity: 1000000, refill: false, cancelSupported: false, averageTime: "فوري" },
  { providerServiceId: "mock-tt-followers", name: "متابعون تيك توك", category: "متابعون", rate: "3.0000", minQuantity: 100, maxQuantity: 100000, refill: true, cancelSupported: true, averageTime: "0-6 ساعات" },
  { providerServiceId: "mock-tt-views", name: "مشاهدات فيديو تيك توك", category: "مشاهدات", rate: "0.1500", minQuantity: 1000, maxQuantity: 5000000, refill: false, cancelSupported: false, averageTime: "فوري" },
  { providerServiceId: "mock-yt-views", name: "مشاهدات يوتيوب", category: "مشاهدات", rate: "2.5000", minQuantity: 500, maxQuantity: 1000000, refill: false, cancelSupported: false, averageTime: "0-24 ساعة" },
  { providerServiceId: "mock-yt-subs", name: "مشتركون يوتيوب", category: "متابعون", rate: "8.0000", minQuantity: 50, maxQuantity: 20000, refill: true, cancelSupported: true, averageTime: "0-48 ساعة" },
  { providerServiceId: "mock-sc-views", name: "مشاهدات سناب شات", category: "مشاهدات", rate: "1.8000", minQuantity: 500, maxQuantity: 500000, refill: false, cancelSupported: false, averageTime: "0-3 ساعات" },
  { providerServiceId: "mock-tg-members", name: "أعضاء قناة تيليجرام", category: "متابعون", rate: "2.2000", minQuantity: 100, maxQuantity: 200000, refill: false, cancelSupported: true, averageTime: "0-12 ساعة" }
];

function encodeOrderId(quantity: number): string {
  return `MOCK-${Date.now()}-${quantity}-${randomUUID().slice(0, 8)}`;
}

function decodeOrderId(providerOrderId: string): { createdAt: number; quantity: number } | null {
  const match = /^MOCK-(\d+)-(\d+)-/.exec(providerOrderId);
  if (!match) return null;
  return { createdAt: Number(match[1]), quantity: Number(match[2]) };
}

// Deterministic, self-contained simulator: progress is derived from elapsed
// wall-clock time since the order id was minted, so no extra state storage
// is needed to make status polling behave believably.
export class MockSmmProvider implements SmmProviderAdapter {
  async getServices(): Promise<ProviderServiceDto[]> {
    return MOCK_CATALOG;
  }

  async getBalance(): Promise<string> {
    return "5000.00";
  }

  async createOrder(params: { serviceId: string; link: string; quantity: number }) {
    if (params.link.includes("force-fail")) {
      throw new ProviderApiError("تعذّر إرسال الطلب إلى المزود (محاكاة فشل)");
    }
    return { providerOrderId: encodeOrderId(params.quantity) };
  }

  async getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus> {
    const decoded = decodeOrderId(providerOrderId);
    if (!decoded) throw new ProviderApiError("رقم طلب المزود غير معروف");

    const elapsedSeconds = (Date.now() - decoded.createdAt) / 1000;
    if (elapsedSeconds < 15) {
      return { status: "IN_PROGRESS", startCount: 0, remains: decoded.quantity };
    }
    if (elapsedSeconds < 45) {
      const remains = Math.max(0, Math.round(decoded.quantity * 0.4));
      return { status: "PARTIAL", startCount: 0, remains };
    }
    return { status: "COMPLETED", startCount: 0, remains: 0 };
  }

  async refillOrder(providerOrderId: string) {
    if (!decodeOrderId(providerOrderId)) throw new ProviderApiError("رقم طلب المزود غير معروف");
    return { refillId: `REFILL-${randomUUID().slice(0, 8)}` };
  }

  async cancelOrder(providerOrderId: string): Promise<boolean> {
    return decodeOrderId(providerOrderId) !== null;
  }
}
