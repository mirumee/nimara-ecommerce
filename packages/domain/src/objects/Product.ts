import type { Attribute } from "./Attribute";
import type { Image, TaxedPrice } from "./common";
import type { SearchProduct } from "./SearchProduct";

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

export type Product = ProductBase & {
  attributes: Attribute[];
  images: Image[];
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  images: Image[];
  name: string;
  nonSelectionAttributes: Attribute[];
  selectionAttributes: Attribute[];
};

export type ProductBase = {
  category: {
    name: string;
    slug: string;
  } | null;
  description: string | null;
  id: string;
  name: string;
};

export type RelatedProduct = SearchProduct;
