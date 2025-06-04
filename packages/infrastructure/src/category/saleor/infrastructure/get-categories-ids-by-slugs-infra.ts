import { ok } from "@nimara/domain/objects/Result";

import type {
  GetCategoriesIDsBySlugsInfra,
  SaleorCategoryServiceConfig,
} from "#root/category/types";
import { graphqlClient } from "#root/graphql/client";

import { CategoriesIDsBySlugsDocument } from "../graphql/queries/generated";

export const getCategoriesIDsBySlugsInfra =
  ({
    apiURI,
    logger,
  }: SaleorCategoryServiceConfig): GetCategoriesIDsBySlugsInfra =>
  async ({ slugs, options }) => {
    logger.debug("Fetching the categories ID's from Saleor", {
      slugs,
    });

    if (!slugs || slugs.length === 0) {
      return ok(null);
    }

    const result = await graphqlClient(apiURI).execute(
      CategoriesIDsBySlugsDocument,
      {
        variables: {
          slugs,
        },
        operationName: "CategoriesIDsBySlugsQuery",
        options,
      },
    );

    if (!result.ok) {
      logger.error("Failed to fetch categories ID's from Saleor", {
        error: result.errors,
        slugs,
      });

      return result;
    }

    const categories = result.data.categories;

    if (!categories) {
      return ok(null);
    }

    return ok(categories.edges.map((edge) => edge.node.id));
  };
