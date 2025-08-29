import { Suspense } from "react";

import { Skeleton } from "@nimara/ui/components/skeleton";

import { ProductBreadcrumbs } from "../components/product-breadcrumbs";
import { ProductDescription } from "../components/product-description";
import { ProductMediaWrapper } from "../components/product-media-wrapper";
import {
  ProductReviews,
  ProductReviewsSkeleton,
} from "../components/product-reviews";
import { ProductTitle } from "../components/product-title";
import { RelatedProductsContainer } from "../components/related-products-container";
import { RelatedProductsSkeleton } from "../components/related-products-skeleton";
import {
  VariantSelectorSkeleton,
  VariantSelectorWrapper,
} from "../components/variant-selector-wrapper";
import { ProductProvider } from "../providers/product-provider";
import { type PDPViewProps } from "../types";

/**
 * Custom view for the product details page. To demonstrate a different layout or additional features.
 * @returns A React component rendering the custom view of the product details page.
 */
export const CustomPDPView = async (props: PDPViewProps) => {
  const { slug } = await props.params;

  return (
    <ProductProvider
      slug={slug}
      render={(product, availability) => (
        <div className="relative grid w-full gap-8">
          <ProductBreadcrumbs
            category={product.category}
            productName={product.name}
          />

          <div className="flex flex-wrap justify-center gap-8 md:flex-nowrap md:justify-between">
            <div className="w-full lg:w-1/2">
              <ProductMediaWrapper
                product={product}
                availability={availability}
                showAs="vertical"
              />
            </div>

            <div className="flex w-full flex-col place-content-start gap-4 md:w-1/2">
              <ProductTitle title={product.name} className="text-center" />

              <Suspense fallback={<VariantSelectorSkeleton />}>
                <VariantSelectorWrapper
                  availability={availability}
                  product={product}
                />
              </Suspense>
            </div>
          </div>

          {product.description && (
            <ProductDescription description={product.description} />
          )}

          <Suspense fallback={<ProductReviewsSkeleton />}>
            <ProductReviews />
          </Suspense>

          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProductsContainer slug={slug} />
          </Suspense>
        </div>
      )}
    />
  );
};

/**
 * Skeleton for the custom view of the product details page.
 * @returns A React component rendering the skeleton for the custom view of the product details page.
 */
export const CustomPDPViewSkeleton = () => (
  <div className="relative grid w-full gap-8">
    <Skeleton className="h-8 w-1/4" />

    <div className="grid gap-8 md:grid-cols-2 md:gap-28">
      <div className="grid gap-4 md:col-span-1">
        <Skeleton className="h-48 w-full md:h-96" />

        <div className="hidden justify-center gap-4 md:flex">
          <Skeleton className="h-20 w-1/4" />
          <Skeleton className="h-20 w-1/4" />
          <Skeleton className="h-20 w-1/4" />
        </div>
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

    <Skeleton className="h-40 w-full" />

    <Skeleton className="h-8 w-1/4" />

    <div className="grid gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
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
