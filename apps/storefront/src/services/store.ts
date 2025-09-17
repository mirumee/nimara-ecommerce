import { type StoreService } from "@nimara/infrastructure/store/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: StoreService | null = null;

/**
 * Loads the Saleor StoreService instance.
 * @returns A promise that resolves to the StoreService instance.
 */
export const getStoreService = async (): Promise<StoreService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorStoreService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/store/index"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorStoreService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
