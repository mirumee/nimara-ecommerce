import type { Logger } from "@nimara/infrastructure/logging/types";
import { createSearchService } from "@nimara/infrastructure/search/select";

import { createServiceLoader } from "@/services/integrations/create-loader";
import { resolveSearchProvider } from "@/services/integrations/resolve";
import { buildSearchConfig } from "@/services/integrations/search";

import { emptySearchService } from "./empty-services";

/**
 * Creates a lazy loader for the search service. The storefront only selects the
 * provider (via env) and supplies its config — the provider catalog and wiring
 * live in `@nimara/infrastructure/search/select`.
 * This function is only used by the service registry.
 * @internal
 */
export const createSearchServiceLoader = (logger: Logger) =>
  createServiceLoader({
    resolve: resolveSearchProvider,
    build: (provider, log) =>
      createSearchService(provider, buildSearchConfig(log)),
    emptyService: emptySearchService,
    logger,
  });
