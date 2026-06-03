import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type SearchService } from "#root/use-cases/search/types";

/**
 * Provider manifests for search. Each entry lazily loads its factory + config,
 * so unused providers stay in their own chunk. The provider id catalog
 * ({@link SEARCH_PROVIDER_IDS}) is derived from this array — adding a provider is
 * one entry here plus its co-located `provider.ts` / `config.ts`.
 */
const MANIFESTS = [
  {
    id: "saleor",
    create: async ({ env, logger }) => {
      const [{ saleorSearchService }, { toSaleorSearchConfig }] =
        await Promise.all([
          import("./saleor/provider"),
          import("./saleor/config"),
        ]);

      return saleorSearchService(toSaleorSearchConfig(env, logger));
    },
  },
  {
    id: "algolia",
    create: async ({ env, logger }) => {
      const [{ algoliaSearchService }, { toAlgoliaSearchConfig }] =
        await Promise.all([
          import("./algolia/provider"),
          import("./algolia/config"),
        ]);

      return algoliaSearchService(toAlgoliaSearchConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const [{ dummySearchService }, { toDummySearchConfig }] =
        await Promise.all([
          import("./dummy/provider"),
          import("./dummy/config"),
        ]);

      return dummySearchService(toDummySearchConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<SearchService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createSearchService = selector.create;
export const SEARCH_PROVIDER_IDS = selector.ids;
export type SearchProviderId = (typeof SEARCH_PROVIDER_IDS)[number];
