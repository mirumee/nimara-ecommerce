import { getLogger } from "@nimara/infrastructure/logging/service";
import { type UCPService } from "@nimara/infrastructure/ucp/types";

import { clientEnvs } from "@/envs/client";
import { UCP_CAPABILITIES } from "@/features/ucp/capabilities";
import { UCP_VERSION } from "@/features/ucp/config";
import { MARKETS } from "@/foundation/regions/config";

const serviceByChannel = new Map<string, UCPService>();

/**
 * Maps Saleor channel slug → storefront `[locale]` path segment for continue URLs.
 */
const UCP_CHANNEL_PREFIX_MAP: Record<string, `/${string | undefined}`> = {
  [MARKETS.GB.channel]: `/${MARKETS.GB.id}`,
  [MARKETS.US.channel]: `/`,
} as const;

export const getUCPService = async (config: {
  channelPrefix?: `/${string | undefined}`;
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
    storefrontURL: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
    version: UCP_VERSION,
    capabilities: UCP_CAPABILITIES,
    channel: config.channelSlug,
    channelPrefix:
      config.channelPrefix ?? UCP_CHANNEL_PREFIX_MAP[config.channelSlug],
    logger: getLogger({ name: "ucp" }),
    defaultEmail: config.defaultEmail ?? clientEnvs.NEXT_PUBLIC_DEFAULT_EMAIL,
  });

  serviceByChannel.set(config.channelSlug, service);

  return service;
};
