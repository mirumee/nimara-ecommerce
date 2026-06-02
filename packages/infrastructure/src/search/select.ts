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
 * Resolves and instantiates the search service for the selected provider.
 *
 * This is the single place that knows the provider catalog and how to load each
 * implementation — apps only pass the selected id plus config. The dynamic
 * `import()`s keep each provider in its own lazily-loaded chunk, so unused
 * providers are never bundled. The exhaustive `switch` makes adding an id to
 * {@link SearchProviderId} a compile error until a branch is added here.
 */
export const createSearchService = async (
  provider: SearchProviderId,
  config: SearchServiceConfig,
): Promise<SearchService> => {
  switch (provider) {
    case "saleor": {
      if (!config.saleor) {
        throw new Error(
          "Search provider 'saleor' is selected but its configuration is missing.",
        );
      }

      const { saleorSearchService } = await import("./saleor/provider");

      return saleorSearchService({ ...config.saleor, logger: config.logger });
    }
    case "algolia": {
      if (!config.algolia) {
        throw new Error(
          "Search provider 'algolia' is selected but its credentials/indices are not configured.",
        );
      }

      const { algoliaSearchService } = await import("./algolia/provider");

      return algoliaSearchService({ ...config.algolia, logger: config.logger });
    }
    case "dummy": {
      const { dummySearchService } = await import("./dummy/provider");

      return dummySearchService({ logger: config.logger });
    }
    default: {
      const _exhaustive: never = provider;

      throw new Error(`Unknown search provider: ${String(_exhaustive)}`);
    }
  }
};
