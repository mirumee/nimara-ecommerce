import { type Cart } from "@nimara/domain/objects/Cart";
import { type Line } from "@nimara/domain/objects/common";

export type OptimisticCartAction =
  | { lineId: string; quantity: number; type: "update" }
  | { lineId: string; type: "delete" };

const rescale = <T extends { amount: number }>(
  price: T,
  quantity: number,
  newQuantity: number,
): T => ({
  ...price,
  amount: quantity > 0 ? (price.amount / quantity) * newQuantity : 0,
});

const applyLineQuantity = (line: Line, quantity: number): Line => ({
  ...line,
  quantity,
  total: rescale(line.total, line.quantity, quantity),
  undiscountedTotalPrice: rescale(
    line.undiscountedTotalPrice,
    line.quantity,
    quantity,
  ),
});

const recalculate = (cart: Cart, lines: Line[]): Cart => {
  const linesTotal = cart.lines.reduce(
    (sum, line) => sum + line.total.amount,
    0,
  );
  const nextLinesTotal = lines.reduce(
    (sum, line) => sum + line.total.amount,
    0,
  );

  const basis = linesTotal > 0 ? cart.subtotal.amount / linesTotal : 1;
  const delta = (nextLinesTotal - linesTotal) * basis;

  return {
    ...cart,
    lines,
    linesCount: lines.length,
    linesQuantityCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: {
      ...cart.subtotal,
      amount: Math.max(cart.subtotal.amount + delta, 0),
    },

    total: { ...cart.total, amount: Math.max(cart.total.amount + delta, 0) },
  };
};

export const applyOptimisticCartAction = (
  cart: Cart,
  action: OptimisticCartAction,
): Cart => {
  if (action.type === "delete") {
    return recalculate(
      cart,
      cart.lines.filter((line) => line.id !== action.lineId),
    );
  }

  const { lineId, quantity } = action;

  return recalculate(
    cart,
    cart.lines.map((line) =>
      line.id === lineId ? applyLineQuantity(line, quantity) : line,
    ),
  );
};
