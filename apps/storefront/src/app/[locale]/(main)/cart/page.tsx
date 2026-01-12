import {
  generateStandardCartMetadata,
  StandardCartView,
} from "@nimara/features/cart/shop-basic-cart/standard";

import { getAccessToken } from "@/auth";
import { getCheckoutId, revalidateCart } from "@/features/checkout/cart";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import {
  deleteLineAction,
  updateLineQuantityAction,
} from "./_actions/cart-actions";

export const generateMetadata = generateStandardCartMetadata;

export default async function Page(props: any) {
  const services = await getServiceRegistry();
  const checkoutId = await getCheckoutId();
  const accessToken = await getAccessToken();

  return (
    <StandardCartView
      {...props}
      services={services}
      checkoutId={checkoutId}
      accessToken={accessToken}
      onCartUpdate={revalidateCart}
      onLineQuantityChange={updateLineQuantityAction}
      onLineDelete={deleteLineAction}
      paths={{
        home: paths.home.asPath(),
        checkout: paths.checkout.asPath(),
        checkoutSignIn: paths.checkout.signIn.asPath(),
      }}
    />
  );
}
