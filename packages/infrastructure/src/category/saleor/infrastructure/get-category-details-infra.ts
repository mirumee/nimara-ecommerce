import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";

import type {
  GetCategoryDetailsInfra,
  SaleorCategoryServiceConfig,
} from "#root/category/types";
import { graphqlClient } from "#root/graphql/client";

import { CategoryDetailsQueryDocument } from "../graphql/queries/generated";
import { categorySerializer } from "./serializers";

export const getCategoryDetailsInfra =
  ({ apiURI, logger }: SaleorCategoryServiceConfig): GetCategoryDetailsInfra =>
  async ({ slug, languageCode, options }) => {
    try {
      logger.debug("Fetching the category from Saleor", { slug });

      const result = await graphqlClient(apiURI).execute(
        CategoryDetailsQueryDocument,
        {
          variables: { slug, languageCode: languageCode as LanguageCodeEnum },
          operationName: "CategoryDetailsQuery",
          options,
        },
      );

      if (!result.ok) {
        logger.error("Failed to fetch category from Saleor", {
          error: result.errors,
        });

        return result;
      }

      const category = result.data.category;

      if (!category) {
        return ok(null);
      }

      return ok(categorySerializer(category));
    } catch (e) {
      logger.error("Unexpected error while fetching category from Saleor", {
        error: e,
      });

      return err([
        {
          code: "UNEXPECTED_HTTP_ERROR",
          message: "Unexpected error while fetching category from Saleor",
        },
      ]);
    }
  };
