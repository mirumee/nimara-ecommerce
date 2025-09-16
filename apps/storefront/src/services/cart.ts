import { type CartService } from "@nimara/infrastructure/cart/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: CartService | null = null;

/**
 * Loads the Saleor CartService instance.
 * @returns A promise that resolves to the CartService instance.
 */
export const getCartService = async (): Promise<CartService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorCartService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/cart/providers"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorCartService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
