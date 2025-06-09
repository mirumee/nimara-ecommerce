import { type AllCurrency } from "../consts";

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
    id: string;
    maxQuantity: number;
    name: string;
    sku: string;
  };
};

export type TaxedMoney = { gross: Price; net: Price; tax: Price };
