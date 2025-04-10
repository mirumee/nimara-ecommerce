import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductBase } from "@nimara/domain/objects/Product";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";

import type { ProductBaseFragment } from "../graphql/fragments/generated";
import { ProductBaseQueryDocument } from "../graphql/queries/generated";
import type { GetProductBaseInfra, SaleorStoreServiceConfig } from "../types";

const parseData = (data: ProductBaseFragment): ProductBase => {
  const { id } = data as DeepRequired<DeepNonNullable<ProductBaseFragment>>;
  const name = getTranslation("name", data);
  const description = getTranslation("description", data);

  return {
    id,
    name,
    description,
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
    const result = await graphqlClientV2(apiURI).execute(
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
