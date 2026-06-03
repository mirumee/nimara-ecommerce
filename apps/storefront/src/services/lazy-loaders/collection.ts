import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyCollectionService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader for the collection service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createCollectionServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorCollectionService } =
        await import("@nimara/infrastructure/collection/providers");

      return saleorCollectionService({
        apiURI: getRequiredSaleorApiUrl("collection service"),
        logger,
      });
    },
    emptyService: emptyCollectionService,
    logger,
  });
