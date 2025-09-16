import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { type AllCountryCode } from "@nimara/domain/consts";
import type { Cart } from "@nimara/domain/objects/Cart";
import { type AsyncResult } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
import { type Logger } from "#root/logging/types";

export type CartServiceConfig = {
  apiURI: string;
  logger: Logger;
};

export type WithFetchOptions = { options?: FetchOptions };

export type CartGetInfra = (
  opts: {
    cartId: string;
    countryCode: AllCountryCode;
    languageCode: LanguageCodeEnum;
  } & WithFetchOptions,
) => AsyncResult<Cart>;

export type CartGetUseCase = CartGetInfra;

export type CartCreateInfra = (
  opts: {
    channel: string;
    email?: string;
    languageCode: LanguageCodeEnum;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => AsyncResult<{ cartId: string }>;

export type LinesUpdateInfra = (
  opts: {
    cartId: string;
    lines: { lineId: string; quantity: number }[];
  } & WithFetchOptions,
) => AsyncResult<{ success: true }>;

export type LinesUpdateUseCase = (
  opts: {
    cartId: string;
    lines: { lineId: string; quantity: number }[];
  } & WithFetchOptions,
) => AsyncResult<{ success: true }>;

export type LinesDeleteInfra = (
  opts: {
    cartId: string;
    linesIds: string[];
  } & WithFetchOptions,
) => AsyncResult<{ success: true }>;

export type LinesDeleteUseCase = (
  opts: {
    cartId: string;
    linesIds: string[];
  } & WithFetchOptions,
) => AsyncResult<{ success: true }>;

export type LinesAddInfra = (
  opts: {
    cartId: string;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => AsyncResult<{ success: true }>;

export type LinesAddUseCase = (
  opts: {
    cartId: string | null;
    channel: string;
    email?: string;
    languageCode: LanguageCodeEnum;
    lines: { quantity: number; variantId: string }[];
  } & WithFetchOptions,
) => AsyncResult<{
  cartId: string;
}>;

export type CartService = {
  cartGet: CartGetUseCase;
  linesAdd: LinesAddUseCase;
  linesDelete: LinesDeleteUseCase;
  linesUpdate: LinesUpdateUseCase;
};
