import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type SearchService } from "#root/use-cases/search/types";

import {
  algoliaSearchEnvSchema,
  toAlgoliaSearchConfig,
} from "./algolia/config";
import { toDummySearchConfig } from "./dummy/config";
import { saleorSearchEnvSchema, toSaleorSearchConfig } from "./saleor/config";

/**
 * Provider manifests for search. Config schemas + mappers are imported eagerly
 * (lightweight Zod); only the heavy provider factory is lazy `import()`-ed, so
 * unused providers stay in their own chunk. The provider-id catalog
 * ({@link SEARCH_PROVIDER_IDS}) and the {@link searchProviders} describe-list are
 * derived from this array.
 */
const MANIFESTS = [
  {
    id: "saleor",
    configSchema: saleorSearchEnvSchema,
    create: async ({ env, logger }) => {
      const { saleorSearchService } = await import("./saleor/provider");

      return saleorSearchService(toSaleorSearchConfig(env, logger));
    },
  },
  {
    id: "algolia",
    configSchema: algoliaSearchEnvSchema,
    create: async ({ env, logger }) => {
      const { algoliaSearchService } = await import("./algolia/provider");

      return algoliaSearchService(toAlgoliaSearchConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const { dummySearchService } = await import("./dummy/provider");

      return dummySearchService(toDummySearchConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<SearchService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createSearchService = selector.create;
export const SEARCH_PROVIDER_IDS = selector.ids;
export const searchProviders = selector.providers;
export type SearchProviderId = (typeof SEARCH_PROVIDER_IDS)[number];
