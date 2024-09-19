import type {
  CountryCode,
  LanguageCodeEnum,
  ThumbnailFormatEnum,
} from "@nimara/codegen/schema";
import type {
  Product,
  ProductAvailability,
} from "@nimara/domain/objects/Product";

import type { FetchOptions } from "#root/graphql/client";

export type SaleorStoreServiceConfig = {
  apiURI: string;
  channel: string;
  countryCode: CountryCode;
  languageCode: LanguageCodeEnum;
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

export type StoreService<Config> = (config: Config) => {
  getProductDetails: GetProductDetailsUseCase;
};

export type GetProductAvailabilityDetailsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ availability: ProductAvailability | null; errors: unknown[] }>;

export type GetProductDetailsInfra = (
  opts: ProductDetailOptions,
) => Promise<{ errors: unknown[]; product: Product | null }>;
