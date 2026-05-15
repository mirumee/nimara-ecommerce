import type { CartService } from "@nimara/infrastructure/cart/types";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";

import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader function for the cart service.
 * This function is only used by the service registry.
 * @internal
 */
export const createCartServiceLoader = (logger: Logger) => {
  let cartServiceInstance: CartService | null = null;

  return async (): Promise<CartService> => {
    if (cartServiceInstance) {
      return cartServiceInstance;
    }

    const { saleorCartService } =
      await import("@nimara/infrastructure/cart/providers");

    cartServiceInstance = saleorCartService({
      apiURI: getRequiredSaleorApiUrl("cart service"),
      isMarketplaceEnabled: clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED,
      logger,
      thumbnailFormat: clientEnvs.NEXT_PUBLIC_DEFAULT_IMAGE_FORMAT as
        | "AVIF"
        | "WEBP"
        | "ORIGINAL",
    });

    return cartServiceInstance;
  };
};
