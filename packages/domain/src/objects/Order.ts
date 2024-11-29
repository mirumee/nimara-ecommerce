import type { FulfillmentStatus, OrderStatus } from "../../../codegen/schema";
import type { Attribute } from "./Attribute";
import type { Price } from "./common";
export interface Order {
  created: string;
  fulfillments: {
    lines:
      | {
          id: string;
          orderLine: {
            id: string;
            productName: string;
            productVariantId: string | null;
          } | null;
          quantity: number;
        }[]
      | null;
    status: FulfillmentStatus;
  }[];
  id: string;
  lines: OrderLine[];
  number: string;
  status: OrderStatus;
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
