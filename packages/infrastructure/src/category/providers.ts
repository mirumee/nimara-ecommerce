import { getCategoryIDsBySlugsUseCase } from "#root/use-cases/category/get-category-ids-by-slugs-use-case";

import { getCategoriesIDsBySlugsInfra } from "./saleor/infrastructure/get-categories-ids-by-slugs-infra";
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
});
