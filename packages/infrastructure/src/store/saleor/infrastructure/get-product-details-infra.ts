import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { serializeProduct } from "#root/store/saleor/serializers";

import { IMAGE_FORMAT, IMAGE_SIZES } from "../../config";
import type { GetProductDetailsInfra, StoreServiceConfig } from "../../types";
import { ProductDetailsQueryDocument } from "../graphql/queries/generated";

export const getProductDetailsInfra =
  ({ apiURI, logger }: StoreServiceConfig): GetProductDetailsInfra =>
  async ({
    productSlug,
    customMediaFormat,
    channel,
    languageCode,
    options,
  }) => {
    const result = await graphqlClient(apiURI).execute(
      ProductDetailsQueryDocument,
      {
        options,
        variables: {
          slug: productSlug,
          channel,
          languageCode,
          mediaFormat: customMediaFormat ?? IMAGE_FORMAT,
          mediaSize: IMAGE_SIZES.productDetail,
        },
        operationName: "ProductDetailsQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching the product details", {
        productSlug,
        channel,
        result,
      });

      return result;
    }
    if (!result.data.product) {
      return ok({ product: null });
    }

    return ok({
      product: serializeProduct(result.data.product),
    });
  };
