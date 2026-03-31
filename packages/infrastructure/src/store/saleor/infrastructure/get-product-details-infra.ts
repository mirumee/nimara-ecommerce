import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
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
const VENDOR_STATUS_ATTRIBUTE_SLUG = "vendor-status";

function vendorDisplayNameFromVendorProfilePage(
  page: PageSlugByIdQuery_page_Page,
): string | null {
  const firstValue = page.attributes.find(
    (a) => a.attribute.slug === VENDOR_NAME_ATTRIBUTE_SLUG,
  )?.values[0];

  const fromAttr =
    getTranslation("plainText", firstValue)?.trim() ||
    firstValue?.name?.trim() ||
    firstValue?.value?.trim();

  if (fromAttr) {
    return fromAttr;
  }

  const translated = page.translation?.title?.trim();

  if (translated) {
    return translated;
  }

  return page.title.trim() || null;
}

function vendorStatusIsActive(page: PageSlugByIdQuery_page_Page): boolean {
  const firstValue = page.attributes.find(
    (a) => a.attribute.slug === VENDOR_STATUS_ATTRIBUTE_SLUG,
  )?.values[0];

  const raw =
    getTranslation("plainText", firstValue)?.trim() ||
    firstValue?.value?.trim() ||
    firstValue?.name?.trim() ||
    "";

  return raw.toLowerCase() === "active";
}

export const getProductDetailsInfra =
  ({
    apiURI,
    logger,
    marketplaceEnabled = false,
    saleorAppToken,
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
      const pageVariables = { id: product.vendorId, languageCode };

      let slugResult = await graphqlClient(apiURI).execute(
        PageSlugByIdQueryDocument,
        {
          operationName: "PageSlugByIdQuery",
          options,
          variables: pageVariables,
        },
      );

      if ((!slugResult.ok || !slugResult.data.page) && saleorAppToken) {
        const elevatedOptions = {
          ...options,
          next: undefined,
          cache: "no-store" as const,
        };

        slugResult = await graphqlClient(apiURI, saleorAppToken).execute(
          PageSlugByIdQueryDocument,
          {
            operationName: "PageSlugByIdQuery",
            options: elevatedOptions,
            variables: pageVariables,
          },
        );
      }

      const vendorPage = slugResult.ok ? slugResult.data.page : null;

      if (
        vendorPage?.slug &&
        vendorPage.pageType?.slug === VENDOR_PROFILE_PAGE_TYPE_SLUG &&
        vendorStatusIsActive(vendorPage)
      ) {
        product = {
          ...product,
          vendorSlug: vendorPage.slug,
          vendorName: vendorDisplayNameFromVendorProfilePage(vendorPage),
        };
      }
    }

    return ok({ product });
  };
