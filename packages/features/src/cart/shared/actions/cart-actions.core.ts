import type { AsyncResult } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export type UpdateLineQuantityCtx = {
  cacheTTL: {
    cart: number;
  };
};

export type UpdateLineQuantityInput = {
  cartId: string;
  lineId: string;
  quantity: number;
};

export type UpdateLineQuantityResult = AsyncResult<{ success: true }>;

/**
 * Pure function for updating line quantity in the cart.
 * This function has no dependencies on Next.js or app-specific code.
 *
 * @param services - Service registry containing cart and logger services
 * @param input - Input parameters: cartId, lineId, and quantity
 * @param ctx - Context: cacheTTL
 * @returns A promise that resolves to the result of updating the line quantity
 */
export async function updateLineQuantity(
  services: ServiceRegistry,
  input: UpdateLineQuantityInput,
  ctx: UpdateLineQuantityCtx,
): Promise<UpdateLineQuantityResult> {
  const { cartId, lineId, quantity } = input;
  const { cacheTTL } = ctx;

  services.logger.debug("Updating line quantity", { cartId, lineId, quantity });

  const cartService = await services.getCartService();
  const result = await cartService.linesUpdate({
    cartId,
    lines: [{ lineId, quantity }],
    options: {
      next: {
        tags: [`CHECKOUT:${cartId}`],
        revalidate: cacheTTL.cart,
      },
    },
  });

  return result;
}

export type DeleteLineCtx = {
  // No context needed for delete, but keeping the pattern consistent
};

export type DeleteLineInput = {
  cartId: string;
  lineId: string;
};

export type DeleteLineResult = AsyncResult<{ success: true }>;

/**
 * Pure function for deleting a line from the cart.
 * This function has no dependencies on Next.js or app-specific code.
 *
 * @param services - Service registry containing cart and logger services
 * @param input - Input parameters: cartId and lineId
 * @param ctx - Context (empty for now, but kept for consistency)
 * @returns A promise that resolves to the result of deleting the line
 */
export async function deleteLine(
  services: ServiceRegistry,
  input: DeleteLineInput,
  _ctx: DeleteLineCtx,
): Promise<DeleteLineResult> {
  const { cartId, lineId } = input;

  services.logger.debug("Deleting line from cart", { cartId, lineId });

  const cartService = await services.getCartService();
  const result = await cartService.linesDelete({
    cartId,
    linesIds: [lineId],
    options: {
      next: { tags: [`CHECKOUT:${cartId}`] },
    },
  });

  return result;
}
