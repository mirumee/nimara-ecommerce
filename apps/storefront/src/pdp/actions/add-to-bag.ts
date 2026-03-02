"use server";

import { err } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { serverEnvs } from "@/envs/server";
import {
  getCheckoutId,
  getCheckoutIdForVendor,
  revalidateCart,
  setCheckoutIdCookie,
  setVendorCheckoutId,
} from "@/lib/actions/cart";
import { getVendorIdForVariant } from "@/lib/marketplace/vendor";
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

  let vendorId: string | null = null;
  let linesAddInput: Parameters<typeof cartService.linesAdd>[0];

  if (!serverEnvs.MARKETPLACE_MODE) {
    linesAddInput = {
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
    };
  } else {
    vendorId = await getVendorIdForVariant(variantId);

    if (!vendorId) {
      storefrontLogger.error(
        "Cannot add product to marketplace checkout. Missing vendor.id metadata.",
        { variantId },
      );

      return err([
        {
          code: "CART_LINES_ADD_ERROR",
          field: "vendor.id",
          message: "Missing vendor.id metadata for variant.",
        },
      ]);
    }

    const vendorCheckoutId = await getCheckoutIdForVendor(vendorId);

    linesAddInput = {
      email: user?.email,
      channel: region.market.channel,
      languageCode: region.language.code,
      cartId: vendorCheckoutId,
      lines: [{ variantId, quantity }],
      options: vendorCheckoutId
        ? {
            next: {
              tags: [`CHECKOUT:${vendorCheckoutId}`],
              revalidate: CACHE_TTL.cart,
            },
          }
        : undefined,
    };
  }

  const result = await cartService.linesAdd(linesAddInput);

  if (result.ok) {
    if (!serverEnvs.MARKETPLACE_MODE) {
      if (!cookieCartId) {
        // Save the cartId in the cookie for future requests
        await setCheckoutIdCookie(result.data.cartId);
      }
    } else if (vendorId) {
      await setVendorCheckoutId({
        vendorId,
        checkoutId: result.data.cartId,
      });
    }

    void revalidateCart(linesAddInput.cartId ?? result.data.cartId);
  }

  return result;
};
