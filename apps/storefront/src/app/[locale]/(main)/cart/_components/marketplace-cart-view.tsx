import { type Cart } from "@nimara/domain/objects/Cart";
import { CartDetails } from "@nimara/features/cart/shared/components/cart-details";
import { CartShell } from "@nimara/features/cart/shared/components/cart-shell";
import { EmptyCart } from "@nimara/features/cart/shared/components/empty-cart";
import { type CartViewProps } from "@nimara/features/cart/shared/types";

import { aggregateCarts } from "@/features/checkout/aggregations";
import { getCheckoutIdsByVendor } from "@/features/checkout/cart";
import { MARKETPLACE_NO_VENDOR_BUCKET } from "@/features/checkout/constants";
import { paths } from "@/foundation/routing/paths";

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
    return (
      <CartShell>
        <EmptyCart paths={{ home: paths.home }} />
      </CartShell>
    );
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

    return (
      <CartShell>
        <EmptyCart paths={{ home: paths.home }} />
      </CartShell>
    );
  }

  const { aggregatedCart, lineCheckoutIdMap } = aggregateCarts(cartsWithIds);

  const userService = await services.getUserService();
  const resultUserGet = accessToken
    ? await userService.userGet(accessToken)
    : { ok: false as const, errors: [], data: null };
  const user = resultUserGet.ok ? resultUserGet.data : null;

  const marketplaceService = await services.getMarketplaceService();
  const vendorIdNames: Record<string, string> = {};

  for (const [vendorId, _] of Object.entries(checkoutIdsByVendor)) {
    if (vendorId === MARKETPLACE_NO_VENDOR_BUCKET) {
      vendorIdNames[vendorId] = "Marketplace";
    } else {
      const result = await marketplaceService.vendorGetByID(vendorId);

      if (result.ok) {
        vendorIdNames[vendorId] = result.data.name;
      }
    }
  }

  return (
    <CartShell>
      <CartDetails
        cart={aggregatedCart}
        user={user}
        onLineQuantityChange={onLineQuantityChange}
        onLineDelete={onLineDelete}
        onCartUpdate={onCartUpdate}
        isMarketplaceEnabled={true}
        lineCheckoutIdMap={lineCheckoutIdMap}
        vendorIdNames={vendorIdNames}
        paths={{
          checkout: paths.checkout,
          checkoutSignIn: paths.checkoutSignIn,
        }}
      />
    </CartShell>
  );
};
