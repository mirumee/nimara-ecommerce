import { getFacetsUseCase } from "#root/use-cases/search/get-facets-use-case";
import { getSortByOptionsUseCase } from "#root/use-cases/search/get-sort-by-options-use-case";
import { searchUseCase } from "#root/use-cases/search/search-use-case";
import type { SearchService } from "#root/use-cases/search/types";

import { saleorGetFacetsInfra } from "./infrastructure/get-facets-infra";
import { saleorGetSortByOptionsInfra } from "./infrastructure/get-sort-by-options-infra";
import { saleorSearchInfra } from "./infrastructure/search-infra";
import { type SaleorSearchServiceConfig } from "./types";

export const saleorSearchService = (config: SaleorSearchServiceConfig) =>
  ({
    getFacets: getFacetsUseCase({
      facetsInfra: saleorGetFacetsInfra(config),
    }),
    getSortByOptions: getSortByOptionsUseCase({
      getSortByOptionsInfra: saleorGetSortByOptionsInfra(config),
    }),
    search: searchUseCase({
      searchInfra: saleorSearchInfra(config),
    }),
  }) satisfies SearchService;
