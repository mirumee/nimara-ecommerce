import type { CartService } from "@nimara/infrastructure/cart/types";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";

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

    const { saleorCartService } = await import(
      "@nimara/infrastructure/cart/providers"
    );

    cartServiceInstance = saleorCartService({
      apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return cartServiceInstance;
  };
};
