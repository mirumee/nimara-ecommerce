"use server";

import { addToBag } from "@nimara/features/product-detail-page/shared/actions/add-to-bag.core";

import {
  getCheckoutId,
  revalidateCart,
  setCheckoutIdCookie,
} from "@/features/checkout/cart";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

/**
 * Server action wrapper for adding items to the cart.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const addToBagAction = async ({
  variantId,
  quantity = 1,
}: {
  quantity?: number;
  variantId: string;
}) => {
  const [services, cartId] = await Promise.all([
    getServiceRegistry(),
    getCheckoutId(),
  ]);

  const accessToken = await getAccessToken();

  // Call the pure function with services and context
  const result = await addToBag(
    services,
    { variantId, quantity },
    {
      region: services.region,
      cartId,
      accessToken: accessToken ?? null,
      cacheTTL: {
        cart: services.config.cacheTTL.cart,
      },
    },
  );

  // Handle Next.js-specific side effects (cookies, revalidation)
  if (result.ok) {
    if (!cartId) {
      // Save the cartId in the cookie for future requests
      await setCheckoutIdCookie(result.data.cartId);
    }

    void revalidateCart(cartId ?? result.data.cartId);
  }

  return result;
};
