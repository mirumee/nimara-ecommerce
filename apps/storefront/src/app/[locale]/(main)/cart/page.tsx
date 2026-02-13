import {
  generateStandardCartMetadata,
  StandardCartView,
} from "@nimara/features/cart/shop-basic-cart/standard";

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

export const generateMetadata = generateStandardCartMetadata;

export default async function Page(props: any) {
  const [services, region, accessToken, checkoutId] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getAccessToken(),
    getCheckoutId(),
  ]);

  return (
    <StandardCartView
      {...props}
      services={services}
      checkoutId={checkoutId}
      accessToken={accessToken}
      onCartUpdate={revalidateCart}
      region={region}
      logger={storefrontLogger}
      onLineQuantityChange={updateLineQuantityAction}
      onLineDelete={deleteLineAction}
      paths={{
        home: paths.home.asPath(),
        checkout: paths.checkout.asPath(),
        checkoutSignIn: paths.checkout.asPath({ query: { step: "sign-in" } }),
      }}
    />
  );
}
