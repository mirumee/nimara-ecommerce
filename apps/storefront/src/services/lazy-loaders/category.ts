import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/utils/create-loader";

import {
  emptyCategoryService,
  isSaleorConfigured,
} from "../utils/empty-services";
import { getRequiredSaleorApiUrl } from "../utils/required-env";

/**
 * Creates a lazy loader for the category service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createCategoryServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorCategoryService } =
        await import("@nimara/infrastructure/category/providers");

      return saleorCategoryService({
        apiURI: getRequiredSaleorApiUrl("category service"),
        logger,
      });
    },
    emptyService: emptyCategoryService,
    logger,
  });
