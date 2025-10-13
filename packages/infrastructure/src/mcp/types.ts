import { Ok, type AsyncResult } from "@nimara/domain/objects/Result";

import {
  CheckoutSessionCompleteSchema,
  type CheckoutSession,
  type CheckoutSessionCreateSchema,
  type CheckoutSessionUpdateInput,
} from "#root/mcp/schema";
import { type PageInfo } from "#root/use-cases/search/types";
import { type StripePaymentService } from "@nimara/infrastructure/payment/providers";

import { type ProductFeed } from "./schema";

export type GetProductFeedArgs = {
  after?: string;
  before?: string;
  channel: string;
  channelPrefix: string;
  limit: number;
  page?: string;
};

/**
 * @description ACPError represents a standardized error format for the Agentic Commerce Protocol (ACP).
 * @link https://developers.openai.com/commerce/specs/checkout#error
 */
export type ACPError = {
  /**
   * Error type. Possible values are: `invalid_request`
   */
  type: "invalid_request";
  /**
   * Error code. Possible values are: `request_not_idempotent`
   */
  code: "request_not_idempotent";
  /**
   * Human‑readable description of the error.
   */
  message: string;
  /**
   * JSONPath referring to the offending request body field, if applicable.
   */
  param?: string;
};

/**
 * Custom type for ACP responses, it can be either a success or an error.
 */
export type ACPResponse = Promise<
  { ok: false; error: ACPError } | { ok: true; data: CheckoutSession }
>;

/**
 * @description ACPService defines the interface for interacting with a Agentic Commerce Protocol (ACP).
 * @link https://www.agenticcommerce.dev/
 * @link https://developers.openai.com/commerce/specs/checkout
 */
export interface ACPService {
  completeCheckoutSession: (args: {
    checkoutSessionComplete: CheckoutSessionCompleteSchema;
    checkoutSessionId: string;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  createCheckoutSession: (args: {
    input: CheckoutSessionCreateSchema;
  }) => ACPResponse;
  getCheckoutSession: (args: { checkoutSessionId: string }) => ACPResponse;
  getProductFeed: (args: GetProductFeedArgs) => AsyncResult<{
    pageInfo: PageInfo;
    products: ProductFeed;
  }>;
  updateCheckoutSession: (args: {
    checkoutSessionId: string;
    data: CheckoutSessionUpdateInput;
  }) => ACPResponse;
}
