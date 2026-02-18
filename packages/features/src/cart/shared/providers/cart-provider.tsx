import type { Cart } from "@nimara/domain/objects/Cart";
import type { User } from "@nimara/domain/objects/User";
import { type Logger } from "@nimara/foundation/logging/types";
import { type Region } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CartProviderData {
  cart: Cart;
  region: Region;
  user: User | null;
}

export interface CartProviderProps {
  accessToken: string | null;
  checkoutId: string | null;
  emptyCartRender: () => React.ReactNode;
  logger: Logger;
  region: Region;
  render: (data: CartProviderData) => React.ReactNode;
  services: ServiceRegistry;
}

export const CartProvider = async ({
  render,
  emptyCartRender,
  services,
  checkoutId,
  accessToken,
  region,
  logger,
}: CartProviderProps) => {
  if (!checkoutId) {
    logger.debug("No checkoutId cookie. Rendering empty cart.");

    return <>{emptyCartRender()}</>;
  }

  const cartService = await services.getCartService();
  const resultCartGet = await cartService.cartGet({
    cartId: checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        revalidate: services.config.cacheTTL.cart,
        tags: [`CHECKOUT:${checkoutId}`],
      },
    },
  });

  if (!resultCartGet.ok) {
    logger.error("Failed to fetch cart", {
      error: resultCartGet.errors,
      checkoutId,
    });

    return <>{emptyCartRender()}</>;
  }

  if (!resultCartGet.data.lines.length) {
    return emptyCartRender();
  }

  const userService = await services.getUserService();
  const resultUserGet = accessToken
    ? await userService.userGet(accessToken)
    : { ok: false as const, errors: [], data: null };

  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <>
      {render({
        cart: resultCartGet.data,
        user,
        region,
      })}
    </>
  );
};
