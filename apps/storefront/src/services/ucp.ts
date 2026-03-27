import { getLogger } from "@nimara/infrastructure/logging/service";
import { type UCPService } from "@nimara/infrastructure/ucp/types";

import { clientEnvs } from "@/envs/client";
import { UCP_CAPABILITIES } from "@/features/ucp/capabilities";

const serviceByChannel = new Map<string, UCPService>();

export const getUCPService = async (config: {
  channelSlug: string;
  defaultEmail?: string;
}): Promise<UCPService> => {
  const cached = serviceByChannel.get(config.channelSlug);

  if (cached) {
    return cached;
  }

  const { saleorUCPService } =
    await import("@nimara/infrastructure/ucp/saleor/service");

  const service = saleorUCPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    baseUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
    capabilities: UCP_CAPABILITIES,
    channel: config.channelSlug,
    logger: getLogger({ name: "ucp" }),
    defaultEmail: config.defaultEmail ?? clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL,
  });

  serviceByChannel.set(config.channelSlug, service);

  return service;
};
