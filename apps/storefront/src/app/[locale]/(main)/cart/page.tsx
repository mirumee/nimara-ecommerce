import {
  generateStandardCartMetadata,
  StandardCartView,
} from "@nimara/features/cart/shop-basic-cart/standard";

import { clientEnvs } from "@/envs/client";
import { getCheckoutId, revalidateCart } from "@/features/checkout/cart";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import {
  deleteLineAction,
  updateLineQuantityAction,
} from "./_actions/cart-actions";
import { MarketplaceCartView } from "./_components/marketplace-cart-view";

export const generateMetadata = generateStandardCartMetadata;

export default async function Page(props: any) {
  const isMarketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;
  const [services, region, accessToken, checkoutId] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getAccessToken(),
    getCheckoutId(),
  ]);

  const sharedProps = {
    ...props,
    services,
    accessToken,
    onCartUpdate: revalidateCart,
    region,
    logger: storefrontLogger,
    onLineQuantityChange: updateLineQuantityAction,
    onLineDelete: deleteLineAction,
    paths: {
      home: paths.home.asPath(),
      checkout: paths.checkout.asPath(),
      checkoutSignIn: paths.checkout.signIn.asPath(),
    },
  };

  if (isMarketplaceEnabled) {
    return (
      <MarketplaceCartView
        {...sharedProps}
        checkoutIds={[]}
        isMarketplaceEnabled={true}
      />
    );
  }

  return (
    <StandardCartView
      {...sharedProps}
      checkoutIds={checkoutId ? [checkoutId] : []}
      isMarketplaceEnabled={false}
    />
  );
}
