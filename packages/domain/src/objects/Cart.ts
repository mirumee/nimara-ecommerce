import type { CheckoutProblems } from "./Checkout";
import type { Line, Price } from "./common";

export type Cart = {
  id: string;
  lines: Line[];
  linesCount: number;
  linesQuantityCount: number;
  problems: CheckoutProblems;
  subtotal: Price;
  total: Price;
};
