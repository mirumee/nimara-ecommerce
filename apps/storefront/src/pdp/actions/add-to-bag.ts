"use server";

import { type User } from "@nimara/domain/objects/User";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import {
  getCheckoutId,
  revalidateCart,
  setCheckoutIdCookie,
} from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

export const addToBagAction = async ({
  variantId,
  quantity = 1,
}: {
  quantity?: number;
  variantId: string;
}) => {
  storefrontLogger.debug("Adding item to bag", { variantId, quantity });

  const [region, cookieCartId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
    getCartService(),
  ]);

  let user: User | null = null;
  const token = await getAccessToken();

  if (token) {
    const userService = await getUserService();
    const userGetResult = await userService.userGet(token);

    if (userGetResult.ok) {
      user = userGetResult.data;
    }
  }

  const result = await cartService.linesAdd({
    email: user?.email,
    channel: region.market.channel,
    languageCode: region.language.code,
    cartId: cookieCartId,
    lines: [{ variantId, quantity }],
    options: cookieCartId
      ? {
          next: {
            tags: [`CHECKOUT:${cookieCartId}`],
            revalidate: CACHE_TTL.cart,
          },
        }
      : undefined,
  });

  if (result.ok) {
    if (!cookieCartId) {
      // Save the cartId in the cookie for future requests
      await setCheckoutIdCookie(result.data.cartId);
    }

    void revalidateCart(cookieCartId ?? result.data.cartId);
  }

  return result;
};
