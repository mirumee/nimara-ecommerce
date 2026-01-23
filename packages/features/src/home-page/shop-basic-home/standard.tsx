import { Suspense } from "react";

import { AccountNotifications } from "../shared/components/account-notifications";
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
}: StandardHomeViewProps) => {
  return (
    <HomeProvider
      services={services}
      accessToken={accessToken}
      render={({ user, fields }) => (
        <section className="grid w-full content-start">
          <HeroBanner fields={fields} searchPath={paths.search} />
          <Suspense fallback={<ProductsGridSkeleton />}>
            <ProductsGrid
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
