import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { Skeleton } from "@nimara/ui/components/skeleton";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { paths } from "@/lib/paths";
import { RelatedProductsContainer } from "@/pdp/components/related-products-container";
import { RelatedProductsSkeleton } from "@/pdp/components/related-products-skeleton";
import { type PDPViewProps } from "@/pdp/types";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

import { AttributesDropdown } from "../components/attributes-dropdown";
import { ProductBreadcrumbs } from "../components/product-breadcrumbs";
import { ProductHighlights } from "../components/product-highlights";
import { ProductMediaWrapper } from "../components/product-media-wrapper";
import { ProductTitle } from "../components/product-title";
import { VariantSelectorWrapper } from "../components/variant-selector-wrapper";
import { ProductProvider } from "../providers/product-provider";

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
    <ProductProvider
      slug={slug}
      render={(product, availability) => (
        <div className="relative grid w-full gap-4">
          <ProductBreadcrumbs
            category={product.category}
            productName={product.name}
          />

          <div className="grid gap-8 md:grid-cols-2 md:gap-28">
            <div className="md:col-span-1">
              <ProductMediaWrapper
                product={product}
                availability={availability}
                showAs="vertical"
              />
            </div>

            <div className="md:col-span-1">
              <section className="sticky top-28">
                <ProductTitle title={product.name} />

                <VariantSelectorWrapper
                  availability={availability}
                  product={product}
                />

                <ProductHighlights product={product} />
                <AttributesDropdown product={product} />
              </section>
            </div>
          </div>

          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProductsContainer slug={slug} />
          </Suspense>
        </div>
      )}
    />
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

  const url = new URL(
    paths.products.asPath({ slug }),
    clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  );
  const canonicalUrl = url.toString();

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

  const ogImageUrl = `${clientEnvs.NEXT_PUBLIC_STOREFRONT_URL}/products/${slug}/opengraph-image`;

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

/**
 * Skeleton component for the standard PDP view.
 * This component is used to display a loading state while the product data is being fetched.
 * @returns A skeleton component for the standard PDP view.
 */
export const StandardPDPViewSkeleton = () => (
  <div className="relative grid w-full gap-4">
    <Skeleton className="h-8 w-1/4" />

    <div className="grid gap-8 md:grid-cols-2 md:gap-28">
      <div className="md:col-span-1">
        <Skeleton className="h-48 w-full md:h-96" />
      </div>

      <div className="grid gap-2 md:col-span-1">
        <section className="sticky top-28 flex flex-col items-start gap-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="bg-primary h-10 w-full" />
        </section>
      </div>
    </div>

    <Skeleton className="h-8 w-1/4" />
    <div className="flex gap-4 overflow-hidden">
      <Skeleton className="aspect-square w-1/5" />
      <Skeleton className="aspect-square w-1/5" />
      <Skeleton className="aspect-square w-1/5" />
      <Skeleton className="aspect-square w-1/5" />
      <Skeleton className="aspect-square w-1/5" />
    </div>
  </div>
);
