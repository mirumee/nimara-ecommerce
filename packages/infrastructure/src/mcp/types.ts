import { type AsyncResult } from "@nimara/domain/objects/Result";

import {
  CheckoutSessionCompleteSchema,
  type CheckoutSession,
  type CheckoutSessionCreateSchema,
  type CheckoutSessionUpdateSchema,
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
 * @description ACPService defines the interface for interacting with a Agentic Commerce Protocol (ACP).
 * @link https://www.agenticcommerce.dev/
 * @link https://developers.openai.com/commerce/specs/checkout
 */
export interface ACPService {
  completeCheckoutSession: (args: {
    paymentService: () => Promise<StripePaymentService>;
    checkoutSessionComplete: CheckoutSessionCompleteSchema;
    checkoutSessionId: string;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  createCheckoutSession: (args: {
    input: CheckoutSessionCreateSchema;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getCheckoutSession: (args: {
    checkoutSessionId: string;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getProductFeed: (args: GetProductFeedArgs) => AsyncResult<{
    pageInfo: PageInfo;
    products: ProductFeed;
  }>;
  updateCheckoutSession: (args: {
    checkoutSessionId: string;
    data: CheckoutSessionUpdateSchema;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
}
