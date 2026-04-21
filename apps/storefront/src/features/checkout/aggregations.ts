import { type Cart } from "@nimara/domain/objects/Cart";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type Price, type TaxedMoney } from "@nimara/domain/objects/common";

import { type MarketplaceCheckoutItem } from "@/features/checkout/types";

const sumPrices = (prices: Price[]): Price => {
  if (!prices.length) {
    return {
      amount: 0,
      currency: "USD",
    };
  }

  const [firstPrice] = prices;

  return {
    amount: prices.reduce((sum, price) => sum + price.amount, 0),
    currency: firstPrice.currency,
  };
};

const sumTaxedMoney = (values: TaxedMoney[]): TaxedMoney => {
  if (!values.length) {
    return {
      gross: { amount: 0, currency: "USD" },
      net: { amount: 0, currency: "USD" },
      tax: { amount: 0, currency: "USD" },
    };
  }

  return {
    gross: sumPrices(values.map((value) => value.gross)),
    net: sumPrices(values.map((value) => value.net)),
    tax: sumPrices(values.map((value) => value.tax)),
  };
};

export const aggregateCarts = (
  carts: Array<{ cart: Cart; checkoutId: string }>,
): {
  aggregatedCart: Cart;
  lineCheckoutIdMap: Record<string, string>;
} => {
  const [firstCart] = carts;

  if (!firstCart) {
    throw new Error("Cannot aggregate carts: no carts provided.");
  }

  const lineCheckoutIdMap = Object.fromEntries(
    carts.flatMap(({ cart, checkoutId }) =>
      cart.lines.map((line) => [line.id, checkoutId]),
    ),
  );

  return {
    aggregatedCart: {
      id: firstCart.checkoutId,
      lines: carts.flatMap(({ cart }) => cart.lines),
      linesCount: carts.reduce((sum, { cart }) => sum + cart.linesCount, 0),
      linesQuantityCount: carts.reduce(
        (sum, { cart }) => sum + cart.linesQuantityCount,
        0,
      ),
      subtotal: sumPrices(carts.map(({ cart }) => cart.subtotal)),
      total: sumPrices(carts.map(({ cart }) => cart.total)),
      problems: {
        insufficientStock: carts.flatMap(
          ({ cart }) => cart.problems.insufficientStock,
        ),
        variantNotAvailable: carts.flatMap(
          ({ cart }) => cart.problems.variantNotAvailable,
        ),
      },
    },
    lineCheckoutIdMap,
  };
};

export const aggregateMarketplaceCheckouts = (
  checkoutItems: MarketplaceCheckoutItem[],
): Checkout => {
  const [firstCheckoutItem] = checkoutItems;

  if (!firstCheckoutItem) {
    throw new Error("Cannot aggregate checkouts: no checkouts provided.");
  }

  const checkouts = checkoutItems.map((item) => item.checkout);
  const [firstCheckout] = checkouts;

  return {
    ...firstCheckout,
    lines: checkouts.flatMap((checkout) => checkout.lines),
    subtotalPrice: sumTaxedMoney(
      checkouts.map((checkout) => checkout.subtotalPrice),
    ),
    shippingPrice: sumTaxedMoney(
      checkouts.map((checkout) => checkout.shippingPrice),
    ),
    totalPrice: sumTaxedMoney(checkouts.map((checkout) => checkout.totalPrice)),
    discount: (() => {
      const discounts = checkouts
        .map((checkout) => checkout.discount)
        .filter(
          (discount): discount is NonNullable<typeof discount> => !!discount,
        );

      if (!discounts.length) {
        return null;
      }

      return sumPrices(discounts);
    })(),
    problems: {
      insufficientStock: checkouts.flatMap(
        (checkout) => checkout.problems.insufficientStock,
      ),
      variantNotAvailable: checkouts.flatMap(
        (checkout) => checkout.problems.variantNotAvailable,
      ),
    },
    isShippingRequired: checkouts.some(
      (checkout) => checkout.isShippingRequired,
    ),
    shippingAddress: checkouts.every(
      (checkout) => !checkout.isShippingRequired || checkout.shippingAddress,
    )
      ? (checkouts.find((checkout) => checkout.shippingAddress)
          ?.shippingAddress ?? null)
      : null,
    billingAddress: checkouts.every((checkout) => checkout.billingAddress)
      ? (checkouts.find((checkout) => checkout.billingAddress)
          ?.billingAddress ?? null)
      : null,
    email: checkouts.every((checkout) => checkout.email)
      ? (checkouts.find((checkout) => checkout.email)?.email ?? null)
      : null,
    deliveryMethod: checkouts.every(
      (checkout) => !checkout.isShippingRequired || checkout.deliveryMethod,
    )
      ? (checkouts.find((checkout) => checkout.deliveryMethod)
          ?.deliveryMethod ?? null)
      : null,
    voucherCode: null,
  };
};
