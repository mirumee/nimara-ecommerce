import { type Category as SaleorCategory } from "@nimara/codegen/schema";
import { type Category } from "@nimara/domain/objects/Category";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type FetchOptions } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

export type SaleorCategoryServiceConfig = {
  apiURI: string;
  logger: Logger;
};

type WithFetchOptions = { options?: FetchOptions };

type CollectionsIDsBySlugsOptions = {
  slugs: string[];
} & WithFetchOptions;

export type GetCategoriesIDsBySlugsInfra = (
  opts: CollectionsIDsBySlugsOptions,
) => AsyncResult<SaleorCategory["id"][] | null>;

type CategoryDetailsOptions = {
  slug: string;
} & WithFetchOptions;

export type GetCategoryDetailsInfra = (
  opts: CategoryDetailsOptions,
) => AsyncResult<Category | null>;

export type GetCategoryDetailsUseCase = GetCategoryDetailsInfra;

export type CategoryService = {
  getCategoriesIDsBySlugs: GetCategoriesIDsBySlugsInfra;
  getCategoryDetails: GetCategoryDetailsUseCase;
};
