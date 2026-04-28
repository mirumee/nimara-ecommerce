"use server";

import {
  deleteLine,
  type DeleteLineInput,
  updateLineQuantity,
} from "@nimara/features/cart/shared/actions/cart-actions.core";

import {
  getAllCheckoutIds,
  revalidateCart,
  setMarketplaceCheckoutIdsCookie,
} from "@/features/checkout/server";
import { getCurrentRegion } from "@/foundation/regions";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";

/**
 * Server action wrapper for updating line quantity in the cart.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const updateLineQuantityAction = async ({
  cartId,
  lineId,
  quantity,
}: {
  cartId: string;
  lineId: string;
  quantity: number;
}) => {
  const services = await getServiceRegistry();

  // If the quantity is 0, delete the line
  if (quantity === 0) {
    const result = await deleteLineAction({ cartId, lineId });

    if (result.ok) {
      void revalidateCart(cartId);
    } else {
      storefrontLogger.error("Failed to delete line", {
        cartId,
        lineId,
        errors: result.errors,
      });
    }

    return result;
  }

  // Call the pure function with services and context
  const result = await updateLineQuantity(
    services,
    { cartId, lineId, quantity },
    {
      cacheTTL: {
        cart: services.config.cacheTTL.cart,
      },
    },
  );

  // Handle Next.js-specific side effects (revalidation)
  if (result.ok) {
    void revalidateCart(cartId);
  } else {
    storefrontLogger.error("Failed to update line quantity", {
      cartId,
      lineId,
      quantity,
      errors: result.errors,
    });
  }

  return result;
};

/**
 * Server action wrapper for deleting a line from the cart.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const deleteLineAction = async ({ cartId, lineId }: DeleteLineInput) => {
  const services = await getServiceRegistry();

  // Call the pure function with services and context
  const result = await deleteLine(services, { cartId, lineId }, {});

  // Handle Next.js-specific side effects (revalidation)
  if (result.ok) {
    void revalidateCart(cartId);
  } else {
    storefrontLogger.error("Failed to delete line", {
      cartId,
      lineId,
      errors: result.errors,
    });
  }

  return result;
};

/**
 * This server function removes a line from a cart.
 * @param cartId - The ID of the cart to delete the line from.
 * @param lineId - The ID of the line to delete from the cart.
 * @returns The result of the delete operation.
 */
export const deleteLineMarketplaceAction = async ({
  cartId,
  lineId,
}: DeleteLineInput) => {
  // Standard delete line logic from above
  const result = await deleteLineAction({ cartId, lineId });

  // Marketplace specific logic
  // If the delete succeeded, check if the cart is now empty and clean up marketplace cookie
  if (result.ok) {
    const [services, region] = await Promise.all([
      getServiceRegistry(),
      getCurrentRegion(),
    ]);
    const cartService = await services.getCartService();
    const cartAfterDelete = await cartService.cartGet({
      cartId,
      languageCode: region.language.code,
      countryCode: region.market.countryCode,
    });

    if (cartAfterDelete.ok && cartAfterDelete.data.lines.length === 0) {
      // Cart is now empty, find and remove this checkout ID from the marketplace cookie
      const allCheckoutIds = await getAllCheckoutIds();

      if (allCheckoutIds) {
        // Find the vendor key that maps to this cartId
        const vendorKeyToRemove = Object.entries(allCheckoutIds).find(
          ([_, checkoutId]) => checkoutId === cartId,
        )?.[0];

        if (vendorKeyToRemove) {
          // Remove this vendor's checkout ID from the cookie
          const { [vendorKeyToRemove]: _, ...remainingCheckoutIds } =
            allCheckoutIds;

          await setMarketplaceCheckoutIdsCookie(remainingCheckoutIds);
        }
      }
    }
  }

  return result;
};
