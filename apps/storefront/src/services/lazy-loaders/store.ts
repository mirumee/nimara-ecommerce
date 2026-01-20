import type { Logger } from "@nimara/infrastructure/logging/types";
import type { StoreService } from "@nimara/infrastructure/store/types";

import { clientEnvs } from "@/envs/client";

/**
 * Creates a lazy loader function for the store service.
 * This function is only used by the service registry.
 * @internal
 */
export const createStoreServiceLoader = (logger: Logger) => {
  let storeServiceInstance: StoreService | null = null;

  return async (): Promise<StoreService> => {
    if (storeServiceInstance) {
      return storeServiceInstance;
    }

    const { saleorStoreService } = await import(
      "@nimara/infrastructure/store/index"
    );

    storeServiceInstance = saleorStoreService({
      apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return storeServiceInstance;
  };
};
