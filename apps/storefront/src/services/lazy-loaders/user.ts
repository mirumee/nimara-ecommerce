import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/utils/create-loader";

import { emptyUserService, isSaleorConfigured } from "../utils/empty-services";
import { getRequiredSaleorApiUrl } from "../utils/required-env";

/**
 * Creates a lazy loader for the user service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createUserServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorUserService } =
        await import("@nimara/infrastructure/user/index");

      return saleorUserService({
        apiURL: getRequiredSaleorApiUrl("user service"),
        logger,
      });
    },
    emptyService: emptyUserService,
    logger,
  });
