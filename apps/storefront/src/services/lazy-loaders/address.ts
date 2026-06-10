import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/utils/create-loader";

import {
  emptyAddressService,
  isSaleorConfigured,
} from "../utils/empty-services";
import { getRequiredSaleorApiUrl } from "../utils/required-env";

/**
 * Creates a lazy loader for the address service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createAddressServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorAddressService } =
        await import("@nimara/infrastructure/address/index");

      return saleorAddressService({
        apiURL: getRequiredSaleorApiUrl("address service"),
        logger,
      });
    },
    emptyService: emptyAddressService,
    logger,
  });
