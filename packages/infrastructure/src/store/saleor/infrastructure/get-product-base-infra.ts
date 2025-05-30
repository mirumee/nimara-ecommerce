import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductBase } from "@nimara/domain/objects/Product";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";

import type {
  GetProductBaseInfra,
  SaleorStoreServiceConfig,
} from "../../types";
import type { ProductBaseFragment } from "../graphql/fragments/generated";
import { ProductBaseQueryDocument } from "../graphql/queries/generated";

const parseData = (data: ProductBaseFragment): ProductBase => {
  const { id } = data as DeepRequired<DeepNonNullable<ProductBaseFragment>>;
  const name = getTranslation("name", data);
  const description = getTranslation("description", data);

  return {
    id,
    name,
    description,
    category: data.category,
  };
};

export const getProductBaseInfra =
  ({
    apiURI,
    channel,
    languageCode,
    logger,
  }: SaleorStoreServiceConfig): GetProductBaseInfra =>
  async ({ productSlug, options }) => {
    const result = await graphqlClient(apiURI).execute(
      ProductBaseQueryDocument,
      {
        options,
        variables: {
          slug: productSlug,
          channel,
          languageCode,
        },
        operationName: "ProductBaseQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching the basic product details", {
        productSlug,
        channel,
        result,
      });

      return result;
    }

    if (!result.data.product) {
      return ok({ product: null });
    }

    return ok({ product: parseData(result.data.product) });
  };
