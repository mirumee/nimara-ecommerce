import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductBasicDetails } from "@nimara/domain/objects/Product";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
import { loggingService } from "#root/logging/service";

import type { ProductBasicDetailsFragment } from "../graphql/fragments/generated";
import { ProductBasicDetailsQueryDocument } from "../graphql/queries/generated";
import type {
  GetProductBasicDetailsInfra,
  SaleorStoreServiceConfig,
} from "../types";

const parseData = (data: ProductBasicDetailsFragment): ProductBasicDetails => {
  const { id } = data as DeepRequired<
    DeepNonNullable<ProductBasicDetailsFragment>
  >;
  const name = getTranslation("name", data);
  const description = getTranslation("description", data);

  return {
    id,
    name,
    description,
  };
};

export const getProductBasicDetailsInfra =
  ({
    apiURI,
    channel,
    languageCode,
  }: SaleorStoreServiceConfig): GetProductBasicDetailsInfra =>
  async ({ productSlug, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
      ProductBasicDetailsQueryDocument,
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
