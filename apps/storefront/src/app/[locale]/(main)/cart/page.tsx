import {
  generateStandardCartMetadata,
  StandardCartView,
} from "@nimara/features/cart/shop-basic-cart/standard";

import { clientEnvs } from "@/envs/client";
import { getCheckoutId, revalidateCart } from "@/features/checkout/server";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import {
  deleteLineAction,
  deleteLineMarketplaceAction,
  updateLineQuantityAction,
} from "./_actions/cart-actions";
import { MarketplaceCartView } from "./_components/marketplace-cart-view";

export const generateMetadata = generateStandardCartMetadata;

export default async function Page(props: any) {
  const [services, region, accessToken] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getAccessToken(),
  ]);

  const sharedProps = {
    ...props,
    services,
    accessToken,
    onCartUpdate: revalidateCart,
    region,
    logger: storefrontLogger,
    onLineQuantityChange: updateLineQuantityAction,
    paths: {
      home: paths.home.asPath(),
      checkout: paths.checkout.asPath(),
      checkoutSignIn: paths.checkout.signIn.asPath(),
    },
  };

  if (clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED) {
    return (
      <MarketplaceCartView
        {...sharedProps}
        onLineDelete={deleteLineMarketplaceAction}
      />
    );
  }

  const checkoutId = await getCheckoutId();

  return (
    <StandardCartView
      {...sharedProps}
      onLineDelete={deleteLineAction}
      checkoutId={checkoutId}
    />
  );
}
