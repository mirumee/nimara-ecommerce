import type { CollectionService } from "@nimara/infrastructure/collection/types";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";

/**
 * Creates a lazy loader function for the collection service.
 * This function is only used by the service registry.
 * @internal
 */
export const createCollectionServiceLoader = (logger: Logger) => {
  let collectionServiceInstance: CollectionService | null = null;

  return async (): Promise<CollectionService> => {
    if (collectionServiceInstance) {
      return collectionServiceInstance;
    }

    const { saleorCollectionService } =
      await import("@nimara/infrastructure/collection/providers");

    collectionServiceInstance = saleorCollectionService({
      apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return collectionServiceInstance;
  };
};
