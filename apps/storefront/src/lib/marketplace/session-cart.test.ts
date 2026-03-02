import { describe, expect, it } from "vitest";

import { type AllCurrency } from "@nimara/domain/consts";
import { type Cart } from "@nimara/domain/objects/Cart";

import { aggregateMarketplaceCarts } from "./session-cart";

const createCart = ({
  id,
  lineId,
  quantity = 1,
  subtotal = 10,
  total = 15,
  currency = "USD",
}: {
  currency?: AllCurrency;
  id: string;
  lineId: string;
  quantity?: number;
  subtotal?: number;
  total?: number;
}): Cart => ({
  id,
  lines: [
    {
      id: lineId,
      product: {
        id: `product-${id}`,
        name: `Product ${id}`,
        slug: `product-${id}`,
      },
      quantity,
      thumbnail: null,
      total: {
        amount: total,
        currency,
        type: "gross",
      },
      undiscountedTotalPrice: {
        amount: total,
        currency,
      },
      variant: {
        discount: null,
        id: `variant-${id}`,
        maxQuantity: 99,
        name: `Variant ${id}`,
        selectionAttributes: [],
        sku: `SKU-${id}`,
      },
    },
  ],
  linesCount: 1,
  linesQuantityCount: quantity,
  subtotal: {
    amount: subtotal,
    currency,
  },
  total: {
    amount: total,
    currency,
  },
  problems: {
    insufficientStock: [],
    variantNotAvailable: [],
  },
});

describe("aggregateMarketplaceCarts", () => {
  it("merges lines and computes totals from all vendor carts", () => {
    const cartA = createCart({
      id: "checkout-a",
      lineId: "line-a",
      quantity: 2,
      subtotal: 20,
      total: 24,
    });
    const cartB = createCart({
      id: "checkout-b",
      lineId: "line-b",
      quantity: 1,
      subtotal: 10,
      total: 16,
    });

    const result = aggregateMarketplaceCarts([
      { checkoutId: "checkout-a", cart: cartA },
      { checkoutId: "checkout-b", cart: cartB },
    ]);

    expect(result.checkoutIds).toEqual(["checkout-a", "checkout-b"]);
    expect(result.cart.lines).toHaveLength(2);
    expect(result.cart.lines[0]?.sourceCheckoutId).toBe("checkout-a");
    expect(result.cart.lines[1]?.sourceCheckoutId).toBe("checkout-b");
    expect(result.cart.linesQuantityCount).toBe(3);
    expect(result.cart.subtotal.amount).toBe(30);
    expect(result.cart.total.amount).toBe(40);
    expect(result.hasMixedCurrencies).toBe(false);
  });

  it("marks mixed currencies in session cart", () => {
    const cartUSD = createCart({
      id: "checkout-usd",
      lineId: "line-usd",
      currency: "USD",
    });
    const cartEUR = createCart({
      id: "checkout-eur",
      lineId: "line-eur",
      currency: "EUR",
    });

    const result = aggregateMarketplaceCarts([
      { checkoutId: "checkout-usd", cart: cartUSD },
      { checkoutId: "checkout-eur", cart: cartEUR },
    ]);

    expect(result.hasMixedCurrencies).toBe(true);
  });
});
