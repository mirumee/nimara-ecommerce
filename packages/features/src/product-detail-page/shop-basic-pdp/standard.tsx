import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
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
  region,
  marketplaceEnabled = false,
}: PDPViewProps) => {
  const { slug } = await params;
  const tVendor = await getTranslations("vendor");

  return (
    <ProductProvider
      slug={slug}
      region={region}
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
                region={region}
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
                  region={region}
                  isMarketplaceEnabled={marketplaceEnabled}
                  addToBagAction={addToBagAction}
                />

                <ProductHighlights product={product} />
                <AttributesDropdown product={product} />

                {marketplaceEnabled && paths.vendor && product.vendorSlug ? (
                  <p className="text-muted-foreground mt-4 text-sm">
                    <LocalizedLink
                      href={paths.vendor(product.vendorSlug)}
                      className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                      {product.vendorName
                        ? tVendor("pdp_visit_vendor_shop_named", {
                            vendorName: product.vendorName,
                          })
                        : tVendor("pdp_visit_vendor_shop")}
                    </LocalizedLink>
                  </p>
                ) : null}
              </section>
            </div>
          </div>

          <Suspense fallback={<RelatedProductsSkeleton />}>
            <RelatedProductsContainer
              slug={slug}
              services={services}
              productPath={paths.product}
              region={region}
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
