import { Suspense } from "react";

import { AccountNotifications } from "../shared/components/account-notifications";
import { AnimatedBanner } from "../shared/components/animated-banner";
import { FoundationBanner } from "../shared/components/foundation-banner";
import { HeroBanner } from "../shared/components/hero-banner";
import { Newsletter } from "../shared/components/newsletter-form";
import {
  ProductsGrid,
  ProductsGridSkeleton,
} from "../shared/components/products-grid";
import { HomeProvider } from "../shared/providers/home-provider";
import { type StandardHomeViewProps } from "../shared/types";

/**
 * Standard view for the home page.
 * @param props - The properties for the home view.
 * @returns A React component rendering the standard home page.
 */
export const StandardHomeView = async ({
  mailTo,
  services,
  accessToken,
  heroBannerProductSlug,
  paths,
  revalidateTime,
  region,
}: StandardHomeViewProps) => {
  let heroBannerImageUrl: string | undefined;

  if (heroBannerProductSlug) {
    const storeService = await services.getStoreService();
    const result = await storeService.getProductDetails({
      productSlug: heroBannerProductSlug,
      channel: region.market.channel,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
      options: {
        next: {
          tags: [`product:${heroBannerProductSlug}`],
          revalidate: revalidateTime,
        },
      },
    });

    heroBannerImageUrl = result.ok
      ? (result.data.product.images[0]?.url ?? undefined)
      : undefined;
  }

  return (
    <HomeProvider
      region={region}
      services={services}
      revalidateTime={revalidateTime}
      accessToken={accessToken}
      render={({ user, fields }) => (
        <section className="grid w-full content-start">
          <HeroBanner
            fields={fields}
            searchPath={paths.search}
            backgroundImageUrl={heroBannerImageUrl}
          />
          <AnimatedBanner />
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid
              region={region}
              fields={fields}
              services={services}
              productPath={paths.product}
              searchPath={paths.search}
            />
          </Suspense>
          <div>
            <AccountNotifications
              user={user}
              mailTo={mailTo}
              paths={{ home: paths.home, privacyPolicy: paths.privacyPolicy }}
            />
          </div>
          <FoundationBanner />
          <div className="mb-8">
            <Newsletter />
          </div>
        </section>
      )}
    />
  );
};
