import type { Logger } from "@nimara/infrastructure/logging/types";
import { createSearchService } from "@nimara/infrastructure/search/select";

import { resolveSearchProvider } from "@/services/integrations/resolve";
import { createServiceLoader } from "@/services/utils/create-loader";

import { emptySearchService } from "../utils/empty-services";

/**
 * Creates a lazy loader for the search service. The storefront only selects the
 * provider (via env) and forwards the env record — the provider catalog, wiring
 * and per-provider config contracts live in
 * `@nimara/infrastructure/search/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createSearchServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveSearchProvider,
    build: (provider, log) =>
      createSearchService(provider, { env: process.env, logger: log }),
    emptyService: emptySearchService,
    logger,
  });
