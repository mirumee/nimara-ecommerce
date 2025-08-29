import type { TaxedPrice } from "@nimara/domain/objects/common";
import type { RelatedProduct } from "@nimara/domain/objects/Product";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  GetProductRelatedProductsInfra,
  StoreServiceConfig,
} from "../../types";
import type { ProductRelatedProductsFragment } from "../graphql/fragments/generated";
import { ProductRelatedProductsQueryDocument } from "../graphql/queries/generated";

const parseRelatedProducts = (
  data: ProductRelatedProductsFragment[],
): RelatedProduct[] => {
  return (
    data.map((node) => {
      const hasFreeVariants =
        node.variants?.some(
          (variant) => variant?.pricing?.price?.gross?.amount === 0,
        ) ?? false;

      return {
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
        slug: node.slug,
        updatedAt: new Date(),
        price: hasFreeVariants
          ? ({
              amount: 0,
              currency: node.pricing?.priceRange?.start?.gross?.currency,
            } as TaxedPrice)
          : ({
              ...node.pricing?.priceRange?.start?.gross,
            } as TaxedPrice),
        undiscountedPrice: hasFreeVariants
          ? ({
              amount: 0,
              currency: node.pricing?.priceRange?.start?.gross?.currency,
            } as TaxedPrice)
          : ({
              ...node.pricing?.priceRangeUndiscounted?.start?.gross,
            } as TaxedPrice),
      };
    }) ?? []
  );
};

export const getProductRelatedProductsInfra =
  ({ apiURI, logger }: StoreServiceConfig): GetProductRelatedProductsInfra =>
  async ({ productSlug, channel, options }) => {
    const result = await graphqlClient(apiURI).execute(
      ProductRelatedProductsQueryDocument,
      {
        options,
        variables: {
          slug: productSlug,
          channel,
        },
        operationName: "ProductRelatedProductsQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching product related products", {
        productSlug,
        channel,
        result,
      });

      return result;
    }

    const nodes =
      result.data?.product?.category?.products?.edges
        ?.map((edge) => edge?.node)
        ?.filter((node): node is ProductRelatedProductsFragment => !!node)
        ?.filter((node) => node.slug !== productSlug) ?? [];

    if (!nodes) {
      return ok({ products: null });
    }

    return ok({ products: parseRelatedProducts(nodes) });
  };
