import { Suspense } from "react";

import { Skeleton } from "@nimara/ui/components/skeleton";

import { AttributesDropdown } from "../shared/components/attributes-dropdown";
import { ProductBreadcrumbs } from "../shared/components/product-breadcrumbs";
import { ProductHighlights } from "../shared/components/product-highlights";
import { ProductMediaWrapper } from "../shared/components/product-media-wrapper";
import { ProductTitle } from "../shared/components/product-title";
import { RelatedProductsContainer } from "../shared/components/related-products-container";
import { RelatedProductsSkeleton } from "../shared/components/related-products-skeleton";
import { VariantSelectorWrapper } from "../shared/components/variant-selector-wrapper";
import { ProductProvider } from "../shared/providers/product-provider";
import { type PDPViewProps } from "../shared/types";

/**
 * Standard view for the product details page.
 * @param param0 - The properties for the base view.
 * @param param0.productDescription - Optional description of the product to display or component to render.
 * @param param0.productName - Name of the product to display or component to render.
 * @returns A React component rendering the base view of the product details page.
 */
export const StandardPDPView = async ({
  params,
  services,
  paths,
  checkoutId,
  addToBagAction,
}: PDPViewProps) => {
  const { slug } = await params;

  return (
    <ProductProvider
      slug={slug}
      services={services}
      render={(product, availability) => (
        <div className="relative grid w-full gap-4">
          <ProductBreadcrumbs
            category={product.category}
            productName={product.name}
            homePath={paths.home}
            searchPath={paths.search}
          />

          <div className="grid gap-8 md:grid-cols-2 md:gap-28">
            <div className="md:col-span-1">
              <ProductMediaWrapper
                product={product}
                availability={availability}
                services={services}
                checkoutId={checkoutId}
                showAs="vertical"
              />
            </div>

            <div className="md:col-span-1">
              <section className="sticky top-28">
                <ProductTitle title={product.name} />

                <VariantSelectorWrapper
                  availability={availability}
                  product={product}
                  services={services}
                  checkoutId={checkoutId}
                  cartPath={paths.cart}
                  addToBagAction={addToBagAction}
                />

                <ProductHighlights product={product} />
                <AttributesDropdown product={product} />
              </section>
            </div>
          </div>

          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProductsContainer
              slug={slug}
              services={services}
              productPath={paths.product}
            />
          </Suspense>
        </div>
      )}
    />
  );
};

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
