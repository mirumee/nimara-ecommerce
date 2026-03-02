import { type Cart } from "@nimara/domain/objects/Cart";
import { type CartService } from "@nimara/infrastructure/cart/types";

import { CACHE_TTL } from "@/config";
import { serverEnvs } from "@/envs/server";
import { getCheckoutId, getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { type WithRegion } from "@/lib/types";

type SessionCartResult = {
  cart: Cart;
  checkoutIds: string[];
  hasMixedCurrencies: boolean;
};

type CartSource = {
  cart: Cart;
  checkoutId: string;
};

export const aggregateMarketplaceCarts = (
  sources: CartSource[],
): SessionCartResult => {
  const lines = sources.flatMap(({ cart, checkoutId }) =>
    cart.lines.map((line) => ({
      ...line,
      sourceCheckoutId: checkoutId,
    })),
  );

  const insufficientStock = sources.flatMap(({ cart, checkoutId }) =>
    cart.problems.insufficientStock.map((problem) => ({
      ...problem,
      line: {
        ...problem.line,
        sourceCheckoutId: checkoutId,
      },
    })),
  );

  const variantNotAvailable = sources.flatMap(({ cart, checkoutId }) =>
    cart.problems.variantNotAvailable.map((problem) => ({
      ...problem,
      line: {
        ...problem.line,
        sourceCheckoutId: checkoutId,
      },
    })),
  );

  const currencies = new Set(
    sources.flatMap(({ cart }) => [
      cart.total.currency,
      cart.subtotal.currency,
    ]),
  );
  const fallbackCurrency = sources[0].cart.total.currency;
  const hasMixedCurrencies = currencies.size > 1;

  const subtotal = {
    currency: fallbackCurrency,
    amount: sources.reduce((sum, { cart }) => sum + cart.subtotal.amount, 0),
  };

  const total = {
    currency: fallbackCurrency,
    amount: sources.reduce((sum, { cart }) => sum + cart.total.amount, 0),
  };

  return {
    hasMixedCurrencies,
    checkoutIds: sources.map(({ checkoutId }) => checkoutId),
    cart: {
      id: sources[0].checkoutId,
      lines,
      linesCount: lines.length,
      linesQuantityCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      total,
      problems: {
        insufficientStock,
        variantNotAvailable,
      },
    },
  };
};

const getCartByCheckoutId = async ({
  cartService,
  checkoutId,
  region,
}: {
  cartService: CartService;
  checkoutId: string;
  region: WithRegion["region"];
}) =>
  cartService.cartGet({
    cartId: checkoutId,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: { revalidate: CACHE_TTL.cart, tags: [`CHECKOUT:${checkoutId}`] },
    },
  });

export const getSessionCart = async ({
  cartService,
  region,
}: {
  cartService: CartService;
  region: WithRegion["region"];
}): Promise<SessionCartResult | null> => {
  if (!serverEnvs.MARKETPLACE_MODE) {
    const checkoutId = await getCheckoutId();

    if (!checkoutId) {
      return null;
    }

    const result = await getCartByCheckoutId({
      cartService,
      checkoutId,
      region,
    });

    if (!result.ok) {
      return null;
    }

    return {
      cart: result.data,
      checkoutIds: [checkoutId],
      hasMixedCurrencies: false,
    };
  }

  const checkoutIds = await getMarketplaceCheckoutIds();

  if (!checkoutIds.length) {
    return null;
  }

  const settled = await Promise.allSettled(
    checkoutIds.map(async (checkoutId) => {
      const result = await getCartByCheckoutId({
        cartService,
        checkoutId,
        region,
      });

      if (!result.ok) {
        return null;
      }

      return {
        checkoutId,
        cart: result.data,
      };
    }),
  );

  const sources: CartSource[] = settled
    .filter(
      (entry): entry is PromiseFulfilledResult<CartSource | null> =>
        entry.status === "fulfilled" && !!entry.value,
    )
    .map(({ value }) => value)
    .filter((value): value is CartSource => !!value);

  if (!sources.length) {
    return null;
  }

  return aggregateMarketplaceCarts(sources);
};
