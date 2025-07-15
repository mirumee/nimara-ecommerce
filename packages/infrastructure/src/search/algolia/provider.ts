import { getFacetsUseCase } from "#root/use-cases/search/get-facets-use-case";
import { getSortByOptionsUseCase } from "#root/use-cases/search/get-sort-by-options-use-case";
import { searchUseCase } from "#root/use-cases/search/search-use-case";
import { type SearchService } from "#root/use-cases/search/types";

import { algoliaGetFacetsInfra } from "./infrastructure/get-facets-infra";
import { algoliaGetSortByOptionsInfra } from "./infrastructure/get-sort-by-options-infra";
import { algoliaSearchInfra } from "./infrastructure/search-infra";
import { type AlgoliaSearchServiceConfig } from "./types";

export const algoliaSearchService = (config: AlgoliaSearchServiceConfig) =>
  ({
    getFacets: getFacetsUseCase({
      facetsInfra: algoliaGetFacetsInfra(config),
    }),
    getSortByOptions: getSortByOptionsUseCase({
      getSortByOptionsInfra: algoliaGetSortByOptionsInfra(config),
    }),
    search: searchUseCase({
      searchInfra: algoliaSearchInfra(config),
    }),
  }) satisfies SearchService;
