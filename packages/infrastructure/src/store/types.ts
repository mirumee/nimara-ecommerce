import type {
  LanguageCodeEnum,
  ThumbnailFormatEnum,
} from "@nimara/codegen/schema";
import { type AllCountryCode } from "@nimara/domain/consts";
import type {
  Product,
  ProductAvailability,
  ProductBase,
  RelatedProduct,
} from "@nimara/domain/objects/Product";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
import type { Logger } from "#root/logging/types";

export interface StoreServiceConfig {
  apiURI: string;
  logger: Logger;
}

export type WithFetchOptions = { options?: FetchOptions };

type ProductDetailOptions = {
  channel: string;
  countryCode: AllCountryCode;
  customMediaFormat?: ThumbnailFormatEnum;
  languageCode: LanguageCodeEnum;
  productSlug: string;
} & WithFetchOptions;

export type GetProductDetailsUseCase = (
  opts: ProductDetailOptions,
) => AsyncResult<{ availability: ProductAvailability; product: Product }>;

export type GetProductAvailabilityDetailsInfra = (opts: {
  channel: string;
  countryCode: AllCountryCode;
  customMediaFormat?: ThumbnailFormatEnum;
  options: FetchOptions;
  productSlug: string;
}) => AsyncResult<{ availability: ProductAvailability | null }>;

export type GetProductDetailsInfra = (opts: {
  channel: string;
  countryCode: AllCountryCode;
  customMediaFormat?: ThumbnailFormatEnum;
  languageCode: LanguageCodeEnum;
  options?: FetchOptions;
  productSlug: string;
}) => AsyncResult<{ product: Product | null }>;

export type GetProductBaseInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ product: ProductBase | null }>;

export type GetProductRelatedProductsInfra = (
  opts: ProductDetailOptions,
) => AsyncResult<{ products: RelatedProduct[] | null }>;

export type GetProductBaseUseCase = GetProductBaseInfra;

export type GetProductRelatedProductsUseCase = GetProductRelatedProductsInfra;

export type StoreService = {
  getProductBase: GetProductBaseUseCase;
  getProductDetails: GetProductDetailsUseCase;
  getProductRelatedProducts: GetProductRelatedProductsUseCase;
};
