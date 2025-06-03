import { err, ok } from "@nimara/domain/objects/Result";

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
    try {
      logger.debug("Fetching the collections ID's from Saleor", {
        slugs,
      });

      if (!slugs || slugs.length === 0) {
        return ok({ results: null });
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
        });

        return result;
      }

      const categories = result.data.categories;

      if (!categories) {
        return ok({
          results: null,
        });
      }

      return ok({
        results: categories.edges.map((edge) => edge.node.id),
      });
    } catch (e) {
      logger.error(
        "Unexpected error while fetching categories ID's from Saleor",
        {
          error: e,
        },
      );

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching categories from Saleor",
        },
      ]);
    }
  };
