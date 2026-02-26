"use server";

import { err } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";
import { getProductVendorIdByVariantId } from "@nimara/infrastructure/store/saleor/infrastructure/get-product-vendor-id-by-variant-infra";

import { getAccessToken } from "@/auth";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import {
  getCheckoutId,
  revalidateCart,
  setCheckoutIdCookie,
} from "@/lib/actions/cart";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";
import { getUserService } from "@/services/user";

const VENDOR_MISMATCH_MESSAGE =
  "Your cart has items from another vendor. You can only add products from the same vendor.";

export const addToBagAction = async ({
  variantId,
  quantity = 1,
  clientProductVendorId = null,
}: {
  /** When server lookup returns null, use this for same-vendor check (PDP already has product.vendorId). */
  clientProductVendorId?: string | null;
  quantity?: number;
  variantId: string;
}) => {
  const marketplaceEnabled = clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED;

  const [region, cookieCartId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
    getCartService(),
  ]);

  // If marketplace is enabled, check if the product vendor matches the cart vendor
  if (marketplaceEnabled && cookieCartId) {
    const cartResult = await cartService.cartGet({
      cartId: cookieCartId,
      countryCode: region.market.countryCode,
      languageCode: region.language.code,
      options: {
        next: { revalidate: 0, tags: [`CHECKOUT:${cookieCartId}`] },
      },
    });

    if (cartResult.ok && cartResult.data.lines.length > 0) {
      const cartVendorId =
        cartResult.data.lines
          .map((l) => l.product.vendorId)
          .find((v): v is string => v != null) ?? null;

      if (
        cartVendorId !== null &&
        clientProductVendorId !== null &&
        clientProductVendorId !== cartVendorId
      ) {
        return err([
          { code: "VENDOR_MISMATCH_ERROR", message: VENDOR_MISMATCH_MESSAGE },
        ]);
      }

      const productVendorId =
        (await getProductVendorIdByVariantId(
          clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
          variantId,
          region.market.channel,
        )) ?? clientProductVendorId;

      if (cartVendorId !== productVendorId) {
        if (cartVendorId !== null && productVendorId === null) {
          return err([
            {
              code: "VENDOR_MIX_NOT_ALLOWED_ERROR",
            },
          ]);
        }
        if (cartVendorId === null && productVendorId !== null) {
          return err([
            {
              code: "VENDOR_MIX_NOT_ALLOWED_ERROR",
            },
          ]);
        }

        return err([
          { code: "VENDOR_MISMATCH_ERROR", message: VENDOR_MISMATCH_MESSAGE },
        ]);
      }
    }
  }

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
