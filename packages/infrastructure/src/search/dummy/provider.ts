import { getFacetsUseCase } from "#root/use-cases/search/get-facets-use-case";
import { getSortByOptionsUseCase } from "#root/use-cases/search/get-sort-by-options-use-case";
import { searchUseCase } from "#root/use-cases/search/search-use-case";
import { type SearchService } from "#root/use-cases/search/types";

import { dummyGetFacetsInfra } from "./infrastructure/get-facets-infra";
import { dummyGetSortByOptionsInfra } from "./infrastructure/get-sort-by-options-infra";
import { dummySearchInfra } from "./infrastructure/search-infra";
import { type DummySearchServiceConfig } from "./types";

export const dummySearchService = (config: DummySearchServiceConfig) =>
  ({
    getFacets: getFacetsUseCase({
      facetsInfra: dummyGetFacetsInfra(config),
    }),
    getSortByOptions: getSortByOptionsUseCase({
      getSortByOptionsInfra: dummyGetSortByOptionsInfra(config),
    }),
    search: searchUseCase({
      searchInfra: dummySearchInfra(config),
    }),
  }) satisfies SearchService;
