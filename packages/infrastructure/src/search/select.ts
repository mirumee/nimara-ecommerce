import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type SearchProviderId } from "#root/providers-catalog";
import { type AlgoliaSearchServiceConfig } from "#root/search/algolia/types";
import { type SaleorSearchServiceConfig } from "#root/search/saleor/types";
import { type SearchService } from "#root/use-cases/search/types";

/**
 * Configuration bag for the search service. Each provider reads only the section
 * it needs; the consuming app supplies the values it owns (Saleor URL, Algolia
 * credentials/indices) without enumerating providers itself.
 */
export type SearchServiceConfig = {
  algolia?: Pick<AlgoliaSearchServiceConfig, "credentials" | "settings">;
  logger: Logger;
  saleor?: Pick<SaleorSearchServiceConfig, "apiURL" | "settings">;
};

/**
 * Resolves and instantiates the search service for the selected provider. The
 * provider catalog and wiring live here; apps only pass the selected id plus
 * config.
 */
export const createSearchService = createServiceSelector<
  SearchService,
  SearchServiceConfig,
  SearchProviderId
>({
  saleor: async (config) => {
    if (!config.saleor) {
      return null;
    }

    const { saleorSearchService } = await import("./saleor/provider");

    return saleorSearchService({ ...config.saleor, logger: config.logger });
  },
  algolia: async (config) => {
    if (!config.algolia) {
      return null;
    }

    const { algoliaSearchService } = await import("./algolia/provider");

    return algoliaSearchService({ ...config.algolia, logger: config.logger });
  },
  dummy: async (config) => {
    const { dummySearchService } = await import("./dummy/provider");

    return dummySearchService({ logger: config.logger });
  },
});
