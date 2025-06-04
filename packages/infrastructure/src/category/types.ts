import { type Category } from "@nimara/codegen/schema";
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
) => AsyncResult<Category["id"][] | null>;

export type CategoryService = {
  getCategoriesIDsBySlugs: GetCategoriesIDsBySlugsInfra;
};
