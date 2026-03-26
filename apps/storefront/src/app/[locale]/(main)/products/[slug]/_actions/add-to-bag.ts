"use server";

import { revalidatePath } from "next/cache";

import { addToBag } from "@nimara/features/product-detail-page/shared/actions/add-to-bag.core";

import {
  getCheckoutId,
  getCheckoutIdForVendor,
  setCheckoutIdCookie,
  setCheckoutIdForVendor,
} from "@/features/checkout/cart";
import { revalidateTag } from "@/foundation/cache/cache";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

const marketplaceEnabled =
  process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false";

/**
 * Server action wrapper for adding items to the cart.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const addToBagAction = async ({
  clientProductVendorId = null,
  variantId,
  quantity = 1,
}: {
  clientProductVendorId?: string | null;
  quantity?: number;
  variantId: string;
}) => {
  const [services, region, accessToken] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getAccessToken(),
  ]);
  const cartId = marketplaceEnabled
    ? await getCheckoutIdForVendor(clientProductVendorId)
    : await getCheckoutId();

  // Call the pure function with services and context
  const result = await addToBag(
    services,
    { variantId, quantity, clientProductVendorId },
    {
      region,
      cartId,
      accessToken: accessToken ?? null,
      cacheTTL: {
        cart: services.config.cacheTTL.cart,
      },
    },
  );

  // Handle Next.js-specific side effects (cookies, revalidation)
  if (result.ok) {
    if (marketplaceEnabled) {
      await setCheckoutIdForVendor(clientProductVendorId, result.data.cartId);
    } else if (!cartId) {
      // Save the cartId in the cookie for future requests
      await setCheckoutIdCookie(result.data.cartId);
    }

    revalidateTag(`CHECKOUT:${cartId ?? result.data.cartId}`, "max");
    revalidatePath(paths.cart.asPath());

    return result;
  }

  storefrontLogger.error("Failed to add item to bag", {
    variantId,
    quantity,
    errors: result.errors,
  });

  return result;
};
