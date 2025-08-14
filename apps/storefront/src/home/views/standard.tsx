import { Suspense } from "react";

import { HeroBanner } from "@/home/components/hero-banner";
import { Newsletter } from "@/home/components/newsletter-form";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "@/home/components/products-grid";
import { HomepageProvider } from "@/home/providers/homepage-provider";

/**
 * Standard home view component.
 * This component renders the homepage layout including the hero banner,
 * the product grid, and the newsletter signup form.
 * @returns JSX.Element
 */
export const StandardHomeView = async () => (
  <HomepageProvider
    render={(cmsData) => (
      <>
        <section className="grid w-full content-start">
          <HeroBanner fields={cmsData?.fields} />

          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid fields={cmsData?.fields} />
          </Suspense>

          <div className="mb-8">
            <Newsletter />
          </div>
        </section>
      </>
    )}
  />
);
