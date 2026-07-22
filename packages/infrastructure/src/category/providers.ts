import { getCategoryDetailsUseCase } from "#root/use-cases/category/get-category-details-use-case";
import { getCategoryIDsBySlugsUseCase } from "#root/use-cases/category/get-category-ids-by-slugs-use-case";

import { getCategoriesIDsBySlugsInfra } from "./saleor/infrastructure/get-categories-ids-by-slugs-infra";
import { getCategoryDetailsInfra } from "./saleor/infrastructure/get-category-details-infra";
import {
  type CategoryService,
  type SaleorCategoryServiceConfig,
} from "./types";

export const saleorCategoryService = (
  config: SaleorCategoryServiceConfig,
): CategoryService => ({
  getCategoriesIDsBySlugs: getCategoryIDsBySlugsUseCase({
    getCategoriesIDsBySlugsInfra: getCategoriesIDsBySlugsInfra(config),
  }),
  getCategoryDetails: getCategoryDetailsUseCase({
    getCategoryDetailsInfra: getCategoryDetailsInfra(config),
  }),
});
