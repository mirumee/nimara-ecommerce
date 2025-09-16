import { type CollectionService } from "@nimara/infrastructure/collection/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: CollectionService | null = null;

/**
 * Loads the Saleor CollectionService instance.
 * @returns A promise that resolves to the CollectionService instance.
 */
export const getCollectionService = async (): Promise<CollectionService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorCollectionService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/collection/providers"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorCollectionService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
