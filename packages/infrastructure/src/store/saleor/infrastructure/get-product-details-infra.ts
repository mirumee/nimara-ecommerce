import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { serializeProduct } from "#root/store/saleor/serializers";

import { IMAGE_FORMAT, IMAGE_SIZES } from "../../config";
import type { GetProductDetailsInfra, StoreServiceConfig } from "../../types";
import {
  type PageSlugByIdQuery_page_Page,
  PageSlugByIdQueryDocument,
  ProductDetailsQueryDocument,
} from "../graphql/queries/generated";

const VENDOR_PROFILE_PAGE_TYPE_SLUG = "vendor-profile";
const VENDOR_NAME_ATTRIBUTE_SLUG = "vendor-name";

function vendorDisplayNameFromVendorProfilePage(
  page: PageSlugByIdQuery_page_Page,
): string | null {
  const fromAttr = page.attributes
    .find((a) => a.attribute.slug === VENDOR_NAME_ATTRIBUTE_SLUG)
    ?.values[0]?.name?.trim();

  if (fromAttr) {
    return fromAttr;
  }

  const translated = page.translation?.title?.trim();

  if (translated) {
    return translated;
  }

  return page.title.trim() || null;
}

export const getProductDetailsInfra =
  ({
    apiURI,
    logger,
    marketplaceEnabled = false,
  }: StoreServiceConfig): GetProductDetailsInfra =>
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

    let product = serializeProduct(result.data.product);

    if (marketplaceEnabled && product.vendorId) {
      const slugResult = await graphqlClient(apiURI).execute(
        PageSlugByIdQueryDocument,
        {
          operationName: "PageSlugByIdQuery",
          options,
          variables: { id: product.vendorId, languageCode },
        },
      );

      if (
        slugResult.ok &&
        slugResult.data.page?.slug &&
        slugResult.data.page.pageType?.slug === VENDOR_PROFILE_PAGE_TYPE_SLUG
      ) {
        product = {
          ...product,
          vendorSlug: slugResult.data.page.slug,
          vendorName: vendorDisplayNameFromVendorProfilePage(
            slugResult.data.page,
          ),
        };
      }
    }

    return ok({ product });
  };
