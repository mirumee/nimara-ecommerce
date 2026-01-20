import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { type GenerateStandardPDPMetadataProps } from "../types";

/**
 * Generates metadata for the product details page.
 * @param param0 - The properties for generating metadata.
 * @param param0.slug - The slug of the product.
 * @description Generates metadata for the product details page.
 * This function fetches product details and constructs metadata including title and description.
 * It uses the product's SEO title and description, or falls back to a default description if
 * @returns Metadata object containing title and description for the product page.
 */

export async function generateStandardPDPMetadata({
  params,
  services,
  storefrontUrl,
  productPath,
}: GenerateStandardPDPMetadataProps): Promise<Metadata> {
  const [{ slug }, t] = await Promise.all([
    params,
    getTranslations("products"),
  ]);

  const url = new URL(productPath, storefrontUrl);
  const canonicalUrl = url.toString();

  const storeService = await services.getStoreService();
  const result = await storeService.getProductBase({
    productSlug: slug,
    channel: services.region.market.channel,
    languageCode: services.region.language.code,
    countryCode: services.region.market.countryCode,
    options: {
      next: {
        revalidate: services.config.cacheTTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!result.data?.product) {
    return {
      title: "Product",
      description: "Product details",
    };
  }

  const fallbackDescription = result?.data?.product?.name
    ? t("check-out-the-product", { productName: result?.data?.product?.name })
    : t("discover-our-product");

  const ogImageUrl = `${storefrontUrl}/products/${slug}/opengraph-image`;

  return {
    title: result.data.product.seo.title || result.data.product.name,
    description: result.data?.product?.seo.description ?? fallbackDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: result.data.product.name,
        },
      ],
      url: canonicalUrl,
      siteName: "Nimara Store",
    },
  };
}
