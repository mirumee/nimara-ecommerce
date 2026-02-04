import { type Logger } from "@nimara/foundation/logging/types";
import { type CheckoutService } from "@nimara/infrastructure/checkout/types";

import { clientEnvs } from "@/envs/client";

/**
 * Creates a lazy loader function for the checkout service.
 * This function is only used by the service registry.
 * @internal
 * @param logger - The logger to use for the checkout service.
 * @returns A promise that resolves to the checkout service.
 */
export const createCheckoutServiceLoader = (logger: Logger) => {
  let checkoutServiceInstance: CheckoutService | null = null;

  return async (): Promise<CheckoutService> => {
    if (checkoutServiceInstance) {
      return checkoutServiceInstance;
    }

    const { saleorCheckoutService } =
      await import("@nimara/infrastructure/checkout/service");

    checkoutServiceInstance = saleorCheckoutService({
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return checkoutServiceInstance;
  };
};
