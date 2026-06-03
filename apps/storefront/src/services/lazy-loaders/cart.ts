import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyCartService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader for the cart service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createCartServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorCartService } =
        await import("@nimara/infrastructure/cart/providers");

      return saleorCartService({
        apiURI: getRequiredSaleorApiUrl("cart service"),
        isMarketplaceEnabled: clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED,
        logger,
        thumbnailFormat: clientEnvs.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT as
          | "AVIF"
          | "WEBP"
          | "ORIGINAL",
      });
    },
    emptyService: emptyCartService,
    logger,
  });
