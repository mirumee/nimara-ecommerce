import type {
  CountryCode,
  LanguageCodeEnum,
  ThumbnailFormatEnum,
} from "@nimara/codegen/schema";
import type {
  Product,
  ProductAvailability,
  ProductBase,
  RelatedProduct,
} from "@nimara/domain/objects/Product";

import type { FetchOptions } from "#root/graphql/client";

export type SaleorStoreServiceConfig = {
  apiURI: string;
  channel: string;
  languageCode: LanguageCodeEnum;
};

export type SaleorProductServiceConfig = SaleorStoreServiceConfig & {
  countryCode: CountryCode;
};

export type WithFetchOptions = { options?: FetchOptions };

type ProductDetailOptions = {
  customMediaFormat?: ThumbnailFormatEnum;
  productSlug: string;
} & WithFetchOptions;

export type GetProductDetailsUseCase = (opts: ProductDetailOptions) => Promise<
  | {
      data: { availability: ProductAvailability; product: Product };
      errors: unknown[];
    }
  | { data: null; errors: unknown[] }
>;

export type GetProductAvailabilityDetailsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ availability: ProductAvailability | null; errors: unknown[] }>;

export type GetProductDetailsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ errors: unknown[]; product: Product | null }>;

export type GetProductBaseInfra = (
  opts: ProductDetailOptions,
) => Promise<{ errors: unknown[]; product: ProductBase | null }>;

export type GetProductRelatedProductsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ errors: unknown[]; products: RelatedProduct[] | null }>;

export type GetProductBaseUseCase = GetProductBaseInfra;

export type GetProductRelatedProductsUseCase = GetProductRelatedProductsInfra;

export type StoreService<Config> = (config: Config) => {
  getProductBase: GetProductBaseUseCase;
  getProductDetails: GetProductDetailsUseCase;
  getProductRelatedProducts: GetProductRelatedProductsUseCase;
};
