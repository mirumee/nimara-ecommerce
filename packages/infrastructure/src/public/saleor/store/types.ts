import type {
  CountryCode,
  LanguageCodeEnum,
  ThumbnailFormatEnum,
} from "@nimara/codegen/schema";
import type {
  Product,
  ProductAvailability,
  ProductBasicDetails,
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

export type GetProductBasicDetailsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ errors: unknown[]; product: ProductBasicDetails | null }>;

export type GetProductBasicDetailsUseCase = GetProductBasicDetailsInfra;

export type StoreService<Config> = (config: Config) => {
  getProductBasicDetails: GetProductBasicDetailsUseCase;
  getProductDetails: GetProductDetailsUseCase;
};
