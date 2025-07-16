import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async () => {
  const checkoutId = await getCheckoutId();

  if (!checkoutId) {
    storefrontLogger.debug("No checkoutId cookie. Rendering empty cart.");

    return <EmptyCart />;
  }

  const [region, cartService] = await Promise.all([
    getCurrentRegion(),
    getCartService(),
  ]);

  const resultCartGet = await cartService.cartGet({
    cartId: checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: { revalidate: CACHE_TTL.cart, tags: [`CHECKOUT:${checkoutId}`] },
    },
  });

  if (!resultCartGet.ok) {
    storefrontLogger.error("Failed to fetch cart", {
      error: resultCartGet.errors,
    });

    return <EmptyCart />;
  }

  if (!!resultCartGet.data.lines.length) {
    const [accessToken, userService] = await Promise.all([
      getAccessToken(),
      getUserService(),
    ]);
    const resultUserGet = await userService.userGet(accessToken);
    const user = resultUserGet.ok ? resultUserGet.data : null;

    return (
      <CartDetails region={region} cart={resultCartGet.data} user={user} />
    );
  }

  storefrontLogger.error("Rendering empty Cart due to errors.", {
    error: resultCartGet.errors,
    checkoutId,
  });

  return <EmptyCart />;
};
