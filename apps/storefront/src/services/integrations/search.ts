import type { SaleorSearchServiceConfig } from "@nimara/infrastructure/search/saleor/types";
import type { SearchService } from "@nimara/infrastructure/use-cases/search/types";

import { clientEnvs } from "@/envs/client";
import { isSaleorConfigured } from "@/services/lazy-loaders/empty-services";
import {
  getRequiredAlgoliaApiKey,
  getRequiredAlgoliaAppId,
  getRequiredSaleorApiUrl,
} from "@/services/lazy-loaders/required-env";

import { ALGOLIA_INDICES } from "./algolia-indices";
import type { ProviderRegistry, ProviderResolver } from "./types";

const SALEOR_SORTING = [
  {
    saleorValue: { field: "NAME", direction: "ASC" },
    queryParamValue: "name-asc",
    messageKey: "search.name-asc",
  },
  {
    saleorValue: { field: "PRICE", direction: "DESC" },
    queryParamValue: "price-desc",
    messageKey: "search.price-desc",
  },
  {
    saleorValue: { field: "PRICE", direction: "ASC" },
    queryParamValue: "price-asc",
    messageKey: "search.price-asc",
  },
] as const satisfies SaleorSearchServiceConfig["settings"]["sorting"];

export const SEARCH_PROVIDERS = {
  saleor: async (logger) => {
    const { saleorSearchService } =
      await import("@nimara/infrastructure/search/saleor/provider");

    return saleorSearchService({
      apiURL: getRequiredSaleorApiUrl("search service"),
      settings: { sorting: SALEOR_SORTING },
      logger,
    });
  },
  algolia: async (logger) => {
    if (ALGOLIA_INDICES.length === 0) {
      throw new Error(
        "Algolia search is selected but no indices are configured. Set them in src/services/integrations/algolia-indices.ts.",
      );
    }

    const { algoliaSearchService } =
      await import("@nimara/infrastructure/search/algolia/provider");

    return algoliaSearchService({
      credentials: {
        appId: getRequiredAlgoliaAppId("search service"),
        apiKey: getRequiredAlgoliaApiKey("search service"),
      },
      settings: { indices: ALGOLIA_INDICES },
      logger,
    });
  },
} satisfies ProviderRegistry<SearchService>;

export const resolveSearchProvider: ProviderResolver<
  typeof SEARCH_PROVIDERS
> = () => {
  const provider = clientEnvs.SEARCH_SERVICE;

  if (provider === "saleor" && !isSaleorConfigured) {
    return null;
  }

  return provider;
};
