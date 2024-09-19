import type { Attribute } from "./Attribute";
import type { Image, TaxedPrice } from "./common";

export type ProductAvailability = {
  isAvailable: boolean;
  startPrice: TaxedPrice;
  variants: ProductVariantAvailability[];
};

export type ProductVariantAvailability = {
  id: string;
  price: TaxedPrice;
  priceUndiscounted: TaxedPrice;
  quantityAvailable: number | null;
  quantityLimitPerCustomer: number | null;
};

export type Product = {
  description: string | null;
  id: string;
  images: Image[];
  name: string;
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  name: string;
  nonSelectionAttributes: Attribute[];
  selectionAttributes: Attribute[];
};
