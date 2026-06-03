import type { Logger } from "@nimara/infrastructure/logging/types";

import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { createServiceLoader } from "@/services/integrations/create-loader";

import { emptyStoreService, isSaleorConfigured } from "./empty-services";
import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader for the store service (Saleor-backed, with an empty
 * zero-config fallback). This function is only used by the service registry.
 * @internal
 */
export const createStoreServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: () => (isSaleorConfigured ? "saleor" : null),
    build: async () => {
      const { saleorStoreService } =
        await import("@nimara/infrastructure/store/index");

      return saleorStoreService({
        apiURI: getRequiredSaleorApiUrl("store service"),
        logger,
        marketplaceEnabled: clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED,
        saleorAppToken: serverEnvs.SALEOR_APP_TOKEN,
      });
    },
    emptyService: emptyStoreService,
    logger,
  });
