import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { Product } from "@nimara/domain/objects/Product";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
import { parseAttributeData } from "#root/lib/serializers/attribute";

import { IMAGE_FORMAT, IMAGE_SIZES } from "../../config";
import type {
  GetProductDetailsInfra,
  SaleorProductServiceConfig,
} from "../../types";
import type { ProductDetailsFragment } from "../graphql/fragments/generated";
import { ProductDetailsQueryDocument } from "../graphql/queries/generated";

const parseData = (data: ProductDetailsFragment): Product => {
  const { id, media, variants } = data as DeepRequired<
    DeepNonNullable<ProductDetailsFragment>
  >;
  const name = getTranslation("name", data);
  const description = getTranslation("description", data);
  const images = media
    .filter(({ type }) => type === "IMAGE")
    .map(({ alt, url }) => ({ url, alt }));

  return {
    id,
    name,
    description,
    images,
    category: data.category,

    attributes: data.attributes.map(parseAttributeData),
    variants: variants.map(
      ({
        nonSelectionAttributes,
        selectionAttributes,
        id,
        media,
        ...variant
      }) => {
        return {
          id,
          name: getTranslation("name", variant),
          selectionAttributes: selectionAttributes.map(parseAttributeData),
          nonSelectionAttributes:
            nonSelectionAttributes.map(parseAttributeData),
          images: media
            .filter(({ type }) => type === "IMAGE")
            .map(({ alt, url }) => ({ url, alt })),
        };
      },
    ),
  };
};

export const getProductDetailsInfra =
  ({
    apiURI,
    channel,
    languageCode,
    logger,
  }: SaleorProductServiceConfig): GetProductDetailsInfra =>
  async ({ productSlug, customMediaFormat, options }) => {
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
      product: parseData(result.data.product),
    });
  };
