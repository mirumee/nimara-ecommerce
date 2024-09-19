import type { CheckoutLineProblemInsufficientStock } from "./Checkout";
import type { Line, Price } from "./common";

export type Cart = {
  id: string;
  lines: Line[];
  linesCount: number;
  linesQuantityCount: number;
  problems: {
    insufficientStock: CheckoutLineProblemInsufficientStock[];
  };
  subtotal: Price;
  total: Price;
};
