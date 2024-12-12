import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { Product } from "@nimara/domain/objects/Product";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
import { parseAttributeData } from "#root/lib/serializers/attribute";
import { loggingService } from "#root/logging/service";

import { IMAGE_FORMAT, IMAGE_SIZES } from "../config";
import type { ProductDetailsFragment } from "../graphql/fragments/generated";
import { ProductDetailsQueryDocument } from "../graphql/queries/generated";
import type {
  GetProductDetailsInfra,
  SaleorStoreServiceConfig,
} from "../types";

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
    relatedProducts:
      data.category?.products?.edges
        ?.filter(({ node }) => node.id !== id)
        .filter(Boolean)
        .map(({ node }) => {
          return {
            currency: node?.pricing?.priceRange?.start?.gross?.currency ?? "",
            id: node.slug,
            media: null,
            thumbnail: node.thumbnail
              ? {
                  alt: node.thumbnail.alt ?? undefined,
                  url: node.thumbnail.url,
                }
              : null,
            name: node.name,
            price: node.pricing?.priceRange?.start?.gross?.amount ?? 0,
            slug: node.slug,
            updatedAt: new Date(),
          };
        }) ?? [],
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
  }: SaleorStoreServiceConfig): GetProductDetailsInfra =>
  async ({ productSlug, customMediaFormat, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
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
      },
    );

    if (error) {
      loggingService.error("Failed to fetch the product details", {
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
