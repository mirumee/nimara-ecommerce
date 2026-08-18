import { describe, expect, it } from "vitest";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type Line, type PriceType } from "@nimara/domain/objects/common";

import { applyOptimisticCartAction } from "./optimistic";

const createLine = ({
  id,
  quantity,
  unitAmount,
  type = "gross",
}: {
  id: string;
  quantity: number;
  type?: PriceType;
  unitAmount: number;
}): Line => ({
  id,
  quantity,
  thumbnail: null,
  total: { amount: unitAmount * quantity, currency: "USD", type },
  undiscountedTotalPrice: { amount: unitAmount * quantity, currency: "USD" },
  product: {
    id: `product-${id}`,
    name: `Product ${id}`,
    slug: `product-${id}`,
  },
  variant: {
    discount: null,
    id: `variant-${id}`,
    maxQuantity: 10,
    name: `Variant ${id}`,
    selectionAttributes: [],
    sku: `sku-${id}`,
  },
});

const createCart = (lines: Line[], overrides: Partial<Cart> = {}): Cart => {
  const linesTotal = lines.reduce((sum, line) => sum + line.total.amount, 0);

  return {
    id: "checkout-id",
    lines,
    linesCount: lines.length,
    linesQuantityCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    problems: { insufficientStock: [], variantNotAvailable: [] },
    subtotal: { amount: linesTotal, currency: "USD" },
    total: { amount: linesTotal, currency: "USD" },
    ...overrides,
  };
};

describe("applyOptimisticCartAction", () => {
  it("rescales line prices when quantity increases", () => {
    const cart = createCart([
      createLine({ id: "1", quantity: 2, unitAmount: 15 }),
    ]);

    const result = applyOptimisticCartAction(cart, {
      type: "update",
      lineId: "1",
      quantity: 3,
    });

    expect(result.lines[0]?.quantity).toBe(3);
    expect(result.lines[0]?.total.amount).toBe(45);
    expect(result.lines[0]?.undiscountedTotalPrice.amount).toBe(45);
    expect(result.linesQuantityCount).toBe(3);
    expect(result.subtotal.amount).toBe(45);
    expect(result.total.amount).toBe(45);
  });

  it("leaves other lines untouched", () => {
    const otherLine = createLine({ id: "2", quantity: 1, unitAmount: 20 });
    const cart = createCart([
      createLine({ id: "1", quantity: 2, unitAmount: 15 }),
      otherLine,
    ]);

    const result = applyOptimisticCartAction(cart, {
      type: "update",
      lineId: "1",
      quantity: 1,
    });

    expect(result.lines[1]).toBe(otherLine);
    expect(result.subtotal.amount).toBe(35);
  });

  it("composes consecutive updates without drifting the unit price", () => {
    const cart = createCart([
      createLine({ id: "1", quantity: 1, unitAmount: 12.5 }),
    ]);

    const result = [2, 3, 4].reduce(
      (acc, quantity) =>
        applyOptimisticCartAction(acc, {
          type: "update",
          lineId: "1",
          quantity,
        }),
      cart,
    );

    expect(result.lines[0]?.total.amount).toBeCloseTo(50);
    expect(result.subtotal.amount).toBeCloseTo(50);
  });

  it("drops the line and its value on delete", () => {
    const cart = createCart([
      createLine({ id: "1", quantity: 2, unitAmount: 15 }),
      createLine({ id: "2", quantity: 1, unitAmount: 20 }),
    ]);

    const result = applyOptimisticCartAction(cart, {
      type: "delete",
      lineId: "1",
    });

    expect(result.lines).toHaveLength(1);
    expect(result.linesCount).toBe(1);
    expect(result.linesQuantityCount).toBe(1);
    expect(result.subtotal.amount).toBe(20);
  });

  it("shifts a net based subtotal in the gross basis it was serialized with", () => {
    const cart = createCart(
      [createLine({ id: "1", quantity: 2, unitAmount: 100, type: "net" })],
      {
        subtotal: { amount: 246, currency: "USD" },
        total: { amount: 246, currency: "USD" },
      },
    );

    const result = applyOptimisticCartAction(cart, {
      type: "update",
      lineId: "1",
      quantity: 3,
    });

    expect(result.lines[0]?.total.amount).toBe(300);
    expect(result.subtotal.amount).toBeCloseTo(369);
  });

  it("keeps totals non negative and stable for an empty cart", () => {
    const cart = createCart([
      createLine({ id: "1", quantity: 1, unitAmount: 10 }),
    ]);

    const result = applyOptimisticCartAction(cart, {
      type: "delete",
      lineId: "1",
    });

    expect(result.lines).toHaveLength(0);
    expect(result.subtotal.amount).toBe(0);
    expect(result.total.amount).toBe(0);
    expect(
      applyOptimisticCartAction(result, { type: "delete", lineId: "1" })
        .subtotal.amount,
    ).toBe(0);
  });

  it("ignores an unknown line id", () => {
    const cart = createCart([
      createLine({ id: "1", quantity: 2, unitAmount: 15 }),
    ]);

    const result = applyOptimisticCartAction(cart, {
      type: "update",
      lineId: "missing",
      quantity: 5,
    });

    expect(result.lines[0]?.quantity).toBe(2);
    expect(result.subtotal.amount).toBe(30);
  });
});
