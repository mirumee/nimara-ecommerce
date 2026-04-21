import { type Cart } from "@nimara/domain/objects/Cart";
import { CartDetails } from "@nimara/features/cart/shared/components/cart-details";
import { EmptyCart } from "@nimara/features/cart/shared/components/empty-cart";
import { type CartViewProps } from "@nimara/features/cart/shared/types";

import { aggregateCarts } from "@/features/checkout/aggregations";
import { getCheckoutIdsByVendor } from "@/features/checkout/cart";

export const MarketplaceCartView = async (props: CartViewProps) => {
  const {
    services,
    accessToken,
    paths,
    onCartUpdate,
    onLineQuantityChange,
    onLineDelete,
    region,
    logger,
  } = props;

  const checkoutIdsByVendor = await getCheckoutIdsByVendor();
  const checkoutIds = [...new Set(Object.values(checkoutIdsByVendor))];

  if (!checkoutIds.length) {
    return <EmptyCart paths={{ home: paths.home }} />;
  }

  const cartService = await services.getCartService();
  const cartResults = await Promise.all(
    checkoutIds.map(async (checkoutId) => {
      const result = await cartService.cartGet({
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

      if (!result.ok || result.data.lines.length === 0) {
        return null;
      }

      return {
        checkoutId,
        cart: result.data,
      };
    }),
  );

  const cartsWithIds = cartResults.filter(
    (entry): entry is { cart: Cart; checkoutId: string } => entry !== null,
  );

  if (!cartsWithIds.length) {
    logger.debug("No active marketplace checkouts. Rendering empty cart.");

    return <EmptyCart paths={{ home: paths.home }} />;
  }

  const { aggregatedCart, lineCheckoutIdMap } = aggregateCarts(cartsWithIds);

  const userService = await services.getUserService();
  const resultUserGet = accessToken
    ? await userService.userGet(accessToken)
    : { ok: false as const, errors: [], data: null };
  const user = resultUserGet.ok ? resultUserGet.data : null;

  return (
    <div className="mx-auto flex justify-center">
      <div className="max-w-[616px] flex-1 basis-full py-8">
        <CartDetails
          cart={aggregatedCart}
          user={user}
          onLineQuantityChange={onLineQuantityChange}
          onLineDelete={onLineDelete}
          onCartUpdate={onCartUpdate}
          lineCheckoutIdMap={lineCheckoutIdMap}
          paths={{
            checkout: paths.checkout,
            checkoutSignIn: paths.checkoutSignIn,
          }}
        />
      </div>
    </div>
  );
};
