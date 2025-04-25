import { unstable_noStore } from "next/cache";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/regions/server";
import { cartService, userService } from "@/services";
import { storefrontLogger } from "@/services/logging";

import { CartDetails } from "./cart-details";
import { EmptyCart } from "./empty-cart";

export const Cart = async ({ checkoutId }: { checkoutId: string }) => {
  unstable_noStore();

  const accessToken = await getAccessToken();

  const [region, resultUserGet] = await Promise.all([
    getCurrentRegion(),
    userService.userGet(accessToken),
  ]);

  const user = resultUserGet.ok ? resultUserGet.data : null;

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
    return (
      <CartDetails region={region} cart={resultCartGet.data} user={user} />
    );
  }

  return <EmptyCart />;
};
