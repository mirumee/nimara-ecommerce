import { getAccessToken } from "@/auth";
import { getSessionCart } from "@/lib/marketplace/session-cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async () => {
  const [region, cartService] = await Promise.all([
    getCurrentRegion(),
    getCartService(),
  ]);

  const sessionCart = await getSessionCart({
    cartService,
    region,
  });

  if (!sessionCart) {
    storefrontLogger.debug("No checkout in session. Rendering empty cart.");

    return <EmptyCart />;
  }

  if (!!sessionCart.cart.lines.length) {
    const [accessToken, userService] = await Promise.all([
      getAccessToken(),
      getUserService(),
    ]);
    const resultUserGet = await userService.userGet(accessToken);
    const user = resultUserGet.ok ? resultUserGet.data : null;

    return (
      <CartDetails
        region={region}
        cart={sessionCart.cart}
        user={user}
        hasMixedCurrencies={sessionCart.hasMixedCurrencies}
      />
    );
  }

  storefrontLogger.error("Rendering empty Cart due to errors.", {
    checkoutIds: sessionCart.checkoutIds,
  });

  return <EmptyCart />;
};
