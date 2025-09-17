import { type CheckoutService } from "@nimara/infrastructure/checkout/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: CheckoutService | null = null;

/**
 * Loads the Saleor CheckoutService instance.
 * @returns A promise that resolves to the CheckoutService instance.
 */
export const getCheckoutService = async (): Promise<CheckoutService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorCheckoutService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/checkout/service"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorCheckoutService({
    apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
