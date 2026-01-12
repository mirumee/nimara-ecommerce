import { type AsyncResult } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";
import type { Region } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export type AddToBagCtx = {
  accessToken: string | null;
  cacheTTL: {
    cart: number;
  };
  cartId: string | null;
  region: Region;
};

export type AddToBagInput = {
  quantity?: number;
  variantId: string;
};

export type AddToBagResult = AsyncResult<{ cartId: string }>;

/**
 * Pure add-to-bag function that can be used in any context.
 * This function has no dependencies on Next.js or app-specific code.
 *
 * @param services - Service registry containing cart, user, and logger services
 * @param input - Input parameters: variantId and optional quantity
 * @param ctx - Context: region, cartId, accessToken, and cacheTTL
 * @returns A promise that resolves to the result of adding items to the cart
 */
export async function addToBag(
  services: ServiceRegistry,
  input: AddToBagInput,
  ctx: AddToBagCtx,
): Promise<AddToBagResult> {
  const { variantId, quantity = 1 } = input;
  const { region, cartId, accessToken, cacheTTL } = ctx;

  services.logger.debug("Adding item to bag", { variantId, quantity });

  // Get user if access token is available
  let userData: User | null = null;

  if (accessToken) {
    const userGetResult = await services.user.userGet(accessToken);

    if (userGetResult.ok) {
      userData = userGetResult.data;
    }
  }

  // Add item to cart
  const result = await services.cart.linesAdd({
    email: userData?.email,
    channel: region.market.channel,
    languageCode: region.language.code,
    cartId,
    lines: [{ variantId, quantity }],
    options: cartId
      ? {
          next: {
            tags: [`CHECKOUT:${cartId}`],
            revalidate: cacheTTL.cart,
          },
        }
      : undefined,
  });

  return result;
}
