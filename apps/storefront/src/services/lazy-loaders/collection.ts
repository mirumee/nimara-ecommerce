import type { CollectionService } from "@nimara/infrastructure/collection/types";
import type { Logger } from "@nimara/infrastructure/logging/types";

import { emptyCollectionService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

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

    if (!isSaleorConfigured) {
      collectionServiceInstance = emptyCollectionService;

      return collectionServiceInstance;
    }

    const { saleorCollectionService } =
      await import("@nimara/infrastructure/collection/providers");

    collectionServiceInstance = saleorCollectionService({
      apiURI: getRequiredSaleorApiUrl("collection service"),
      logger,
    });

    return collectionServiceInstance;
  };
};
