import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "@/services/integrations/create-loader";
import {
  resolveSearchProvider,
  SEARCH_PROVIDERS,
} from "@/services/integrations/search";

import { emptySearchService } from "./empty-services";

/**
 * Creates a lazy loader for the search service. The active provider
 * (Saleor, Algolia, …) is selected at build time via `SEARCH_PROVIDER`.
 * This function is only used by the service registry.
 * @internal
 */

export const createSearchServiceLoader = (logger: Logger) =>
  createServiceLoader({
    providers: SEARCH_PROVIDERS,
    resolveProvider: resolveSearchProvider,
    emptyService: emptySearchService,
    logger,
  });
