import { getLogger } from "@nimara/infrastructure/logging/service";
import { type UCPService } from "@nimara/infrastructure/ucp/types";

const serviceByChannel = new Map<string, UCPService>();

export const getUCPService = async (config: {
  channelSlug: string;
}): Promise<UCPService> => {
  const cached = serviceByChannel.get(config.channelSlug);

  if (cached) {
    return cached;
  }

  const { saleorUCPService } =
    await import("@nimara/infrastructure/ucp/saleor/service");

  const service = saleorUCPService({
    apiUrl: process.env.NEXT_PUBLIC_SALEOR_API_URL!,
    baseUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL!,
    channel: config.channelSlug,
    logger: getLogger({ name: "ucp" }),
  });

  serviceByChannel.set(config.channelSlug, service);

  return service;
};
