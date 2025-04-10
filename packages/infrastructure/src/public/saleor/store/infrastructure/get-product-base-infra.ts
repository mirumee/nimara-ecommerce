import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductBase } from "@nimara/domain/objects/Product";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
import { loggingService } from "#root/logging/service";

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
  }: SaleorStoreServiceConfig): GetProductBaseInfra =>
  async ({ productSlug, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
      ProductBaseQueryDocument,
      {
        options,
        variables: {
          slug: productSlug,
          channel,
          languageCode,
        },
      },
    );

    if (error) {
      loggingService.error("Failed to fetch the basic product details", {
        productSlug,
        channel,
        error,
      });

      return { errors: [error], product: null };
    }

    return {
      product: data?.product ? parseData(data.product) : null,
      errors: [],
    };
  };
