import type { RelatedProduct } from "@nimara/domain/objects/Product";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import type { ProductRelatedProductsFragment } from "../graphql/fragments/generated";
import { ProductRelatedProductsDocument } from "../graphql/queries/generated";
import type {
  GetProductRelatedProductsInfra,
  SaleorProductServiceConfig,
} from "../types";

const parseRelatedProducts = (
  data: ProductRelatedProductsFragment[],
): RelatedProduct[] => {
  return (
    data.map((node) => ({
      currency: node.pricing?.priceRange?.start?.gross?.currency ?? "",
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
    })) ?? []
  );
};

export const getProductRelatedProductsInfra =
  ({
    apiURI,
    channel,
    languageCode,
  }: SaleorProductServiceConfig): GetProductRelatedProductsInfra =>
  async ({ productSlug, options }) => {
    const { data, error } = await graphqlClient(apiURI).execute(
      ProductRelatedProductsDocument,
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
      loggingService.error("Failed to fetch product related products", {
        productSlug,
        channel,
        error,
      });

      return { errors: [error], products: null };
    }

    const nodes =
      data?.product?.category?.products?.edges
        ?.map((edge) => edge?.node)
        ?.filter((node): node is ProductRelatedProductsFragment => !!node)
        ?.filter((node) => node.slug !== productSlug) ?? [];

    return {
      products: parseRelatedProducts(nodes),
      errors: [],
    };
  };
