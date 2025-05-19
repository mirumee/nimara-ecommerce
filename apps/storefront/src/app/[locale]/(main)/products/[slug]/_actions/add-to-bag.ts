"use server";

import { type User } from "@nimara/domain/objects/User";

import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import {
  getCheckoutId,
  revalidateCheckout,
  setCheckoutIdCookie,
} from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { cartService } from "@/services";
import { storefrontLogger } from "@/services/logging";

export const addToBagAction = async ({
  user,
  variantId,
  quantity = 1,
}: {
  quantity?: number;
  user: User | null;
  variantId: string;
}) => {
  storefrontLogger.debug("Adding item to bag", { variantId, quantity });

  const [region, cartId] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
  ]);

  const service = cartService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    channel: region.market.channel,
    languageCode: region.language.code,
    logger: storefrontLogger,
  });

  const result = await service.linesAdd({
    email: user?.email,
    cartId,
    lines: [{ variantId, quantity }],
    options: cartId
      ? {
          next: {
            tags: [`CHECKOUT:${cartId}`],
            revalidate: CACHE_TTL.cart,
          },
        }
      : undefined,
  });

  if (result.ok) {
    await setCheckoutIdCookie(result.data.cartId);
    await revalidateCheckout(cartId ?? result.data.cartId);
  }

  return result;
};
