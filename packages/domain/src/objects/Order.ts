import { type Attribute } from "./Attribute";
import { type Price } from "./common";

export interface Order {
  created: string;
  id: string;
  lines: OrderLine[];
  number: string;
  total: Price;
}

export interface OrderLine {
  id: string;
  productName: string;
  quantity: number;
  thumbnail: Image | null;
  totalPrice: Price;
  variant: {
    selectionAttributes: Pick<Attribute, "values">[];
  };
  variantName: string;
}

interface Image {
  alt: string | null;
  url: string;
}
