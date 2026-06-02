import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type SearchProviderId } from "#root/providers-catalog";
import { type SearchService } from "#root/use-cases/search/types";

/**
 * Input for the search selector. The app forwards the (server-side) env record
 * and a logger; each provider validates only the env it needs via its own
 * co-located schema, so unused providers' variables are never read.
 */
export type SearchSelectInput = {
  env: Record<string, string | undefined>;
  logger: Logger;
};

/**
 * Resolves and instantiates the search service for the selected provider. The
 * provider catalog, wiring, and per-provider config contracts all live in
 * infrastructure; the app only passes the selected id, env, and logger.
 */
export const createSearchService = createServiceSelector<
  SearchService,
  SearchSelectInput,
  SearchProviderId
>({
  saleor: async ({ env, logger }) => {
    const [{ saleorSearchService }, { toSaleorSearchConfig }] =
      await Promise.all([
        import("./saleor/provider"),
        import("./saleor/config"),
      ]);

    return saleorSearchService(toSaleorSearchConfig(env, logger));
  },
  algolia: async ({ env, logger }) => {
    const [{ algoliaSearchService }, { toAlgoliaSearchConfig }] =
      await Promise.all([
        import("./algolia/provider"),
        import("./algolia/config"),
      ]);

    return algoliaSearchService(toAlgoliaSearchConfig(env, logger));
  },
  dummy: async ({ env, logger }) => {
    const [{ dummySearchService }, { toDummySearchConfig }] = await Promise.all(
      [import("./dummy/provider"), import("./dummy/config")],
    );

    return dummySearchService(toDummySearchConfig(env, logger));
  },
});
