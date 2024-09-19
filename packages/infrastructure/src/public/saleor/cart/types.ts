import {
  type CountryCode,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";
import type { Cart } from "@nimara/domain/objects/Cart";

import type { FetchOptions } from "#root/graphql/client";

import type { CheckoutErrorFragment } from "./graphql/fragments/generated";

export type SaleorCartServiceConfig = {
  apiURI: string;
  channel: string;
  countryCode: CountryCode;
  languageCode: LanguageCodeEnum;
};

export type WithFetchOptions = { options?: FetchOptions };

export type CartGetInfra = (
  opts: { cartId: string } & WithFetchOptions,
) => Promise<Cart | null>;

export type CartGetUseCase = (
  opts: { cartId: string } & WithFetchOptions,
) => Promise<Cart | null>;

export type CartCreateInfra = (
  opts: {
    email?: string;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => Promise<{ cartId: string | null; errors: CheckoutErrorFragment[] }>;

export type LinesUpdateInfra = (
  opts: {
    cartId: string;
    lines: { lineId: string; quantity: number }[];
  } & WithFetchOptions,
) => Promise<CheckoutErrorFragment[]>;

export type LinesUpdateUseCase = (
  opts: {
    cartId: string;
    lines: { lineId: string; quantity: number }[];
  } & WithFetchOptions,
) => Promise<CheckoutErrorFragment[]>;

export type LinesDeleteInfra = (
  opts: {
    cartId: string;
    linesIds: string[];
  } & WithFetchOptions,
) => Promise<CheckoutErrorFragment[]>;

export type LinesDeleteUseCase = (
  opts: {
    cartId: string;
    linesIds: string[];
  } & WithFetchOptions,
) => Promise<CheckoutErrorFragment[]>;

export type LinesAddInfra = (
  opts: {
    cartId: string;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => Promise<CheckoutErrorFragment[]>;

export type LinesAddUseCase = (
  opts: {
    cartId: string | null;
    email?: string;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => Promise<{
  cartId: string | null;
  errors: CheckoutErrorFragment[];
}>;

export type CartService<Config> = (config: Config) => {
  cartGet: CartGetUseCase;
  linesAdd: LinesAddUseCase;
  linesDelete: LinesDeleteUseCase;
  linesUpdate: LinesUpdateUseCase;
};
