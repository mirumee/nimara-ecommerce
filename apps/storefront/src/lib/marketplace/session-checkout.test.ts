import { describe, expect, it } from "vitest";

import { type AllCurrency } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";

import { aggregateMarketplaceCheckouts } from "./session-checkout";

const createTaxedMoney = (amount: number, currency: AllCurrency = "USD") => ({
  gross: { amount, currency },
  net: { amount, currency },
  tax: { amount: 0, currency },
});

const createCheckout = ({
  id,
  lineId,
  quantity = 1,
  subtotal = 10,
  shipping = 5,
  total = 15,
  currency = "USD",
}: {
  currency?: AllCurrency;
  id: string;
  lineId: string;
  quantity?: number;
  shipping?: number;
  subtotal?: number;
  total?: number;
}): Checkout => ({
  authorizeStatus: "NONE",
  availablePaymentGateways: [],
  billingAddress: null,
  chargeStatus: "NONE",
  deliveryMethod: {
    __typename: "ShippingMethod",
    id: `delivery-${id}`,
    name: `Delivery ${id}`,
  },
  discount: null,
  displayGrossPrices: true,
  email: "buyer@example.com",
  id,
  isShippingRequired: true,
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
  problems: {
    insufficientStock: [],
    variantNotAvailable: [],
  },
  shippingAddress: null,
  shippingMethods: [
    {
      id: `shipping-${id}`,
      name: `Shipping ${id}`,
      price: { amount: shipping, currency },
    },
  ],
  shippingPrice: createTaxedMoney(shipping, currency),
  subtotalPrice: createTaxedMoney(subtotal, currency),
  totalPrice: createTaxedMoney(total, currency),
  voucherCode: null,
});

describe("aggregateMarketplaceCheckouts", () => {
  it("aggregates checkout lines and totals and marks source checkout id", () => {
    const checkoutA = createCheckout({
      id: "checkout-a",
      lineId: "line-a",
      quantity: 2,
      subtotal: 20,
      shipping: 4,
      total: 24,
    });
    const checkoutB = createCheckout({
      id: "checkout-b",
      lineId: "line-b",
      quantity: 1,
      subtotal: 10,
      shipping: 6,
      total: 16,
    });

    const result = aggregateMarketplaceCheckouts([
      { checkoutId: "checkout-a", checkout: checkoutA },
      { checkoutId: "checkout-b", checkout: checkoutB },
    ]);

    expect(result.checkoutIds).toEqual(["checkout-a", "checkout-b"]);
    expect(result.hasMixedCurrencies).toBe(false);
    expect(result.checkout.lines).toHaveLength(2);
    expect(result.checkout.lines[0]?.sourceCheckoutId).toBe("checkout-a");
    expect(result.checkout.lines[1]?.sourceCheckoutId).toBe("checkout-b");
    expect(result.checkout.subtotalPrice.gross.amount).toBe(30);
    expect(result.checkout.shippingPrice.gross.amount).toBe(10);
    expect(result.checkout.totalPrice.gross.amount).toBe(40);
    expect(result.checkout.deliveryMethod).toBeNull();
    expect(result.checkout.shippingMethods).toEqual([]);
    expect(result.checkout.discount).toBeNull();
    expect(result.checkout.voucherCode).toBeNull();
  });

  it("flags mixed currencies in aggregated checkout", () => {
    const checkoutUSD = createCheckout({
      id: "checkout-usd",
      lineId: "line-usd",
      currency: "USD",
    });
    const checkoutEUR = createCheckout({
      id: "checkout-eur",
      lineId: "line-eur",
      currency: "EUR",
    });

    const result = aggregateMarketplaceCheckouts([
      { checkoutId: "checkout-usd", checkout: checkoutUSD },
      { checkoutId: "checkout-eur", checkout: checkoutEUR },
    ]);

    expect(result.hasMixedCurrencies).toBe(true);
  });
});
