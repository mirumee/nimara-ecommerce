import {
  type BuyerClass,
  type CheckoutUpdateRequest,
  type MethodElement,
  type PostalAddress,
} from "@ucp-js/sdk";

import { type LanguageCodeEnum } from "@nimara/codegen/schema";

import { type Logger } from "#root/logging/types";

/** Service configuration. */
export type UCPSaleorServiceConfig = {
  apiUrl: string;
  baseUrl: string;
  channel: string;
  languageCode?: LanguageCodeEnum;
  logger: Logger;
};

/** GraphQL mutation error shape. */
export type GraphQLMutationError = {
  message: string | null;
};

/** UCP API error returned to the client. */
export type UCPApiError = {
  code: string;
  message: string;
};

/** Input for get/cancel checkout - session ID. */
export type CheckoutSessionIdInput = {
  id: string;
};

/** Saleor CheckoutLineInput for add/update mutations. */
export type SaleorCheckoutLineInput = {
  quantity: number;
  variantId: string;
};

/** Fallback names when address omits them. Uses SDK BuyerClass fields. */
export type NameFallback = Pick<BuyerClass, "first_name" | "last_name">;

/** UCP fulfillment method shape for update. Uses SDK MethodElement. */
export type UCPFulfillmentMethod = Pick<
  MethodElement,
  "destinations" | "groups"
>;

/** Extended CheckoutUpdateRequest with Saleor-specific fulfillment and billing. */
export type UCPUpdateRequestExtended = CheckoutUpdateRequest & {
  billing_address?: Partial<PostalAddress>;
  buyer?: BuyerClass;
  fulfillment?: {
    methods?: UCPFulfillmentMethod[];
  };
};
