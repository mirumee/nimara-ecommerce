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
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
import type { Logger } from "#root/logging/types";

export type SaleorStoreServiceConfig = {
  apiURI: string;
  channel: string;
  languageCode: LanguageCodeEnum;
  logger: Logger;
};

export type SaleorProductServiceConfig = SaleorStoreServiceConfig & {
  countryCode: CountryCode;
};

export type WithFetchOptions = { options?: FetchOptions };

type ProductDetailOptions = {
  customMediaFormat?: ThumbnailFormatEnum;
  productSlug: string;
} & WithFetchOptions;

export type GetProductDetailsUseCase = (
  opts: ProductDetailOptions,
) => AsyncResult<{ availability: ProductAvailability; product: Product }>;

export type GetProductAvailabilityDetailsInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ availability: ProductAvailability | null }>;

export type GetProductDetailsInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ product: Product | null }>;

export type GetProductBaseInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ product: ProductBase | null }>;

export type GetProductRelatedProductsInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ products: RelatedProduct[] | null }>;

export type GetProductBaseUseCase = GetProductBaseInfra;

export type GetProductRelatedProductsUseCase = GetProductRelatedProductsInfra;

export type StoreService<Config> = (config: Config) => {
  getProductBase: GetProductBaseUseCase;
  getProductDetails: GetProductDetailsUseCase;
  getProductRelatedProducts: GetProductRelatedProductsUseCase;
};
