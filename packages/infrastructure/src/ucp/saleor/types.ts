import {
  type BuyerClass,
  type CheckoutUpdateRequest,
  type MethodElement,
  type PostalAddress,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

import { type LanguageCodeEnum } from "@nimara/codegen/schema";

import { type Logger } from "#root/logging/types";

/** Service configuration. */
export type UCPSaleorServiceConfig = {
  /**
   * Saleor API URL.
   */
  apiUrl: string;
  /**
   * Capabilities to use for checkout sessions and orders.
   */
  capabilities?: UcpDiscoveryProfile["ucp"]["capabilities"];
  /**
   * Channel to use for checkout sessions and orders.
   */
  channel: string;
  /**
   * Default email to use for checkout sessions and orders.
   */
  defaultEmail: string;
  /**
   * Language code to use for checkout sessions and orders.
   */
  languageCode?: LanguageCodeEnum;
  /**
   * Logger to use for logging.
   */
  logger: Logger;
  /**
   * Whether to require AP2 mandate for checkout sessions and orders.
   */
  requireAp2Mandate?: boolean;
  /**
   * Base URL to use for checkout sessions and orders.
   */
  storefrontURL: string;
  /**
   * UCP version to use for checkout sessions and orders.
   */
  version: string;
};

/** GraphQL mutation error shape. */
export type GraphQLMutationError = {
  code?: string | null;
  message?: string | null;
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

/** Conditions for determining if continue_url should be generated. */
export type ContinueUrlConditions = {
  [key: string]: boolean | undefined;
  missingBillingAddress?: boolean;
  missingDeliveryMethod?: boolean;
  missingEmail?: boolean;
  missingShippingAddress?: boolean;
};
