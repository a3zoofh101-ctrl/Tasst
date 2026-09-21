import "server-only";
import type { Provider } from "@prisma/client";
import type { SmmProviderAdapter } from "@/lib/smm/providers/types";
import { MockSmmProvider } from "@/lib/smm/providers/mock";
import { GenericSmmProvider } from "@/lib/smm/providers/generic";
import { decryptSecret } from "@/lib/smm/auth/encryption";

export function getProviderAdapter(provider: Provider): SmmProviderAdapter {
  switch (provider.type) {
    case "MOCK":
      return new MockSmmProvider();
    case "GENERIC": {
      if (!provider.apiUrl || !provider.apiKeyEncrypted) {
        throw new Error(`Provider ${provider.name} is missing apiUrl/apiKey configuration`);
      }
      return new GenericSmmProvider(provider.apiUrl, decryptSecret(provider.apiKeyEncrypted));
    }
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}
