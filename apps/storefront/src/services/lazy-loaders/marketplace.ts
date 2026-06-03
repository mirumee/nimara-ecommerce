import { type Logger } from "@nimara/foundation/logging/types";

import { MARKETPLACE_VENDOR_PROFILE_CACHE_TTL } from "@/config";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyMarketplaceService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader for the marketplace service (Saleor-backed, with an
 * empty zero-config fallback). This function is only used by the service
 * registry.
 * @internal
 */
export const createMarketplaceServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorMarketplaceService } =
        await import("@nimara/infrastructure/marketplace/saleor/service");

      return saleorMarketplaceService({
        apiURL: getRequiredSaleorApiUrl("marketplace service"),
        logger,
        cacheTTL: {
          vendorProfile: MARKETPLACE_VENDOR_PROFILE_CACHE_TTL,
        },
      });
    },
    emptyService: emptyMarketplaceService,
    logger,
  });
