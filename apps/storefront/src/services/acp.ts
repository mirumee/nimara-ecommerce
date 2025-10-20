import { type ACPService } from "@nimara/infrastructure/acp/types";

import { getStorefrontLogger } from "@/services/lazy-logging";

export const CHECKOUT_SESSION_CACHE = 60 * 60; // 1 hour
export const PRODUCT_FEED_CACHE = 5 * 60; // 5 minutes

let loadedACPService: ACPService | null = null;

export const getACPService = async (config: {
  channelSlug: string;
}): Promise<ACPService> => {
  if (loadedACPService) {
    return loadedACPService;
  }

  const [{ saleorACPService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/acp/saleor/service"),
    getStorefrontLogger(),
  ]);

  loadedACPService = saleorACPService({
    apiUrl: process.env.NEXT_PUBLIC_SALEOR_API_URL!,
    logger: storefrontLogger,
    channel: config.channelSlug,
    storefrontUrl: process.env.NEXT_PUBLIC_STOREFRONT_URL!,
    cacheTTL: {
      checkoutSession: CHECKOUT_SESSION_CACHE,
      productFeed: PRODUCT_FEED_CACHE,
    },
  });

  return loadedACPService;
};
