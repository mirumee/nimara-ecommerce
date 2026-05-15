import { Suspense } from "react";

import { AccountNotifications } from "../shared/components/account-notifications";
import { AnimatedPhraseBanner } from "../shared/components/animated-phrase-banner";
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
  paths,
  revalidateTime,
  region,
}: StandardHomeViewProps) => {
  const searchContext = {
    channel: region.market.channel,
    languageCode: region.language.code,
    currency: region.market.currency,
  };
  const searchService = await services.getSearchService();
  const paintResult = await searchService.search(
    { query: "paint", limit: 1 },
    searchContext,
  );
  const paintImageUrl = paintResult.ok
    ? (paintResult.data.results[0]?.thumbnail?.url ?? undefined)
    : undefined;

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
            backgroundImageUrl={paintImageUrl}
          />
          <AnimatedPhraseBanner />
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
          <div className="mb-8">
            <Newsletter />
          </div>
        </section>
      )}
    />
  );
};
