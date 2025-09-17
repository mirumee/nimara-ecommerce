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

/**
 * Represents a product in the e-commerce system.
 * @see {@link ProductBase} for the base structure of a product.
 * @see {@link ProductVariant} for the structure of product variants.
 * @see {@link RelatedProduct} for the structure of related products.
 */
export type Product = ProductBase & {
  attributes: Attribute[];
  images: Image[];
  variants: ProductVariant[];
};

/**
 * Represents a product variant in the e-commerce system.
 * @see {@link Product} for the complete structure of a product.
 * @see {@link ProductBase} for the base structure of a product.
 */
export type ProductVariant = {
  id: string;
  images: Image[];
  name: string;
  nonSelectionAttributes: Attribute[];
  selectionAttributes: Attribute[];
};

/**
 * Base structure for a product in the e-commerce system.
 * @see {@link Product} for the complete structure of a product.
 * @see {@link RelatedProduct} for the structure of related products.
 */
export type ProductBase = {
  category: {
    name: string;
    slug: string;
  } | null;
  description: string | null;
  id: string;
  name: string;
  seo: {
    description?: string | null;
    title?: string | null;
  };
};

export type RelatedProduct = SearchProduct;
