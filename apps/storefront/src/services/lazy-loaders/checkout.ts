import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyCheckoutService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader for the checkout service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createCheckoutServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorCheckoutService } =
        await import("@nimara/infrastructure/checkout/service");

      return saleorCheckoutService({
        apiURL: getRequiredSaleorApiUrl("checkout service"),
        isMarketplaceEnabled: clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED,
        logger,
        thumbnailFormat: clientEnvs.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT as
          | "AVIF"
          | "WEBP"
          | "ORIGINAL",
      });
    },
    emptyService: emptyCheckoutService,
    logger,
  });
