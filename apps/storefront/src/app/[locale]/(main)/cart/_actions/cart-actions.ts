"use server";

import {
    deleteLine,
    updateLineQuantity,
} from "@nimara/features/cart/shared/actions/cart-actions.core";
import { revalidateCart } from "@/features/checkout/cart";
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
    }

    return result;
};

/**
 * Server action wrapper for deleting a line from the cart.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const deleteLineAction = async ({
    cartId,
    lineId,
}: {
    cartId: string;
    lineId: string;
}) => {
    const services = await getServiceRegistry();

    // Call the pure function with services and context
    const result = await deleteLine(services, { cartId, lineId }, {});

    // Handle Next.js-specific side effects (revalidation)
    if (result.ok) {
        void revalidateCart(cartId);
    }

    return result;
};

