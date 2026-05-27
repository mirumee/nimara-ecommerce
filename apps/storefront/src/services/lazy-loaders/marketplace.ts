import { type Logger } from "@nimara/foundation/logging/types";
import { type MarketplaceService } from "@nimara/infrastructure/marketplace/types";

import { MARKETPLACE_VENDOR_PROFILE_CACHE_TTL } from "@/config";

import { emptyMarketplaceService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader function for the checkout service.
 * This function is only used by the service registry.
 * @internal
 * @param logger - The logger to use for the checkout service.
 * @returns A promise that resolves to the checkout service.
 */
export const createMarketplaceServiceLoader = (logger: Logger) => {
  let marketplaceServiceInstance: MarketplaceService | null = null;

  return async (): Promise<MarketplaceService> => {
    if (marketplaceServiceInstance) {
      return marketplaceServiceInstance;
    }

    if (!isSaleorConfigured) {
      marketplaceServiceInstance = emptyMarketplaceService;

      return marketplaceServiceInstance;
    }

    const { saleorMarketplaceService } =
      await import("@nimara/infrastructure/marketplace/saleor/service");

    marketplaceServiceInstance = saleorMarketplaceService({
      apiURL: getRequiredSaleorApiUrl("marketplace service"),
      logger,
      cacheTTL: {
        vendorProfile: MARKETPLACE_VENDOR_PROFILE_CACHE_TTL,
      },
    });

    return marketplaceServiceInstance;
  };
};
