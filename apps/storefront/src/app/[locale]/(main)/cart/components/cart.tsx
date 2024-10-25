import { unstable_noStore } from "next/cache";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { cartService, userService } from "@/services";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async ({ checkoutId }: { checkoutId: string }) => {
  unstable_noStore();

  const accessToken = await getAccessToken();

  const [region, user] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const service = cartService({
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  });

  const cart = await service.cartGet({
    cartId: checkoutId,
    options: {
      next: { revalidate: CACHE_TTL.cart, tags: [`CHECKOUT:${checkoutId}`] },
    },
  });

  if (cart?.lines.length) {
    return <CartDetails region={region} cart={cart} user={user} />;
  }

  return <EmptyCart />;
};
