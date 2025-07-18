import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { CACHE_TTL } from "@/config";
import { ProductDetailsContainer } from "@/pdp/components/product-details-container";
import { ProductDetailsSkeleton } from "@/pdp/components/product-details-skeleton";
import { RelatedProductsContainer } from "@/pdp/components/related-products-container";
import { RelatedProductsSkeleton } from "@/pdp/components/related-products-skeleton";
import { type PDPViewProps } from "@/pdp/types";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

/**
 * Standard view for the product details page.
 * @param param0 - The properties for the base view.
 * @param param0.productDescription - Optional description of the product to display or component to render.
 * @param param0.productName - Name of the product to display or component to render.
 * @returns A React component rendering the base view of the product details page.
 */
export const StandardPDPView = async ({ params }: PDPViewProps) => {
  const { slug } = await params;

  return (
    <div className="relative w-full">
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetailsContainer slug={slug} />
      </Suspense>
      <Suspense fallback={<RelatedProductsSkeleton />}>
        <RelatedProductsContainer slug={slug} />
      </Suspense>
    </div>
  );
};

/**
 * Generates metadata for the product details page.
 * @param param0 - The properties for generating metadata.
 * @param param0.slug - The slug of the product.
 * @description Generates metadata for the product details page.
 * This function fetches product details and constructs metadata including title and description.
 * It uses the product's SEO title and description, or falls back to a default description if
 * @returns Metadata object containing title and description for the product page.
 */
export async function generateStandardPDPMetadata(props: PDPViewProps) {
  const [{ slug }, region, t, storeService] = await Promise.all([
    props.params,
    getCurrentRegion(),
    getTranslations("products"),
    getStoreService(),
  ]);

  const result = await storeService.getProductBase({
    productSlug: slug,
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!result.data?.product) {
    return;
  }

  const fallbackDescription = result?.data?.product?.name
    ? t("check-out-the-product", { productName: result?.data?.product?.name })
    : t("discover-our-product");

  return {
    title: result.data.product.seo.title || result.data.product.name,
    description: result.data?.product?.seo.description ?? fallbackDescription,
  };
}
