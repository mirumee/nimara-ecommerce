import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCheckoutId } from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { cartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { userService } from "@/services/user";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async () => {
  const checkoutId = await getCheckoutId();

  if (!checkoutId) {
    storefrontLogger.debug("No checkoutId cookie. Rendering empty cart.");

    return <EmptyCart />;
  }

  const accessToken = await getAccessToken();

  const [region, resultUserGet] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const service = cartService({
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  const resultCartGet = await service.cartGet({
    cartId: checkoutId,
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
