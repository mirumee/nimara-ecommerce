import { type AllCurrency } from "../consts";
import type { Attribute } from "./Attribute";

export type Price = {
  amount: number;
  currency: AllCurrency;
};

export type PriceType = "gross" | "net";

export type TaxedPrice = Price & { type: PriceType };

export type Image = {
  alt: string | null;
  url: string;
};

export type Line = {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  thumbnail: Image | null;
  total: TaxedPrice;
  undiscountedTotalPrice: Price;
  variant: {
    discount: TaxedPrice | null;
    id: string;
    maxQuantity: number;
    name: string;
    selectionAttributes: Pick<Attribute, "values">[];
    sku: string;
  };
};

export type TaxedMoney = { gross: Price; net: Price; tax: Price };
