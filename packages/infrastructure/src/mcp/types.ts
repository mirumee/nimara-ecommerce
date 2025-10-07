import { CheckoutSession, CheckoutSessionCreateSchema } from "#root/mcp/schema";
import { type PageInfo } from "#root/use-cases/search/types";
import { type AsyncResult } from "@nimara/domain/objects/Result";

export type ProductFeedItem = {};

export type ProductFeed = Array<ProductFeedItem>;

export type GetProductFeedArgs = {
  channel: string;
  limit: number;
  page?: string;
  after?: string;
  before?: string;
};

/**
 * @description ACPService defines the interface for interacting with a Agentic Commerce Protocol (ACP).
 * @link https://www.agenticcommerce.dev/
 * @link https://developers.openai.com/commerce/specs/checkout
 */
export interface ACPService {
  completeCheckoutSession: (args: {
    checkoutSessionId: string;
  }) => AsyncResult<{ orderId: string }>;
  createCheckoutSession: (args: {
    input: CheckoutSessionCreateSchema;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getCheckoutSession: (args: {
    checkoutSessionId: string;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  updateCheckoutSession: (args: {
    checkoutSessionId: string;
    data: unknown;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getProductFeed: (args: GetProductFeedArgs) => AsyncResult<{
    pageInfo: PageInfo;
    products: ProductFeed;
  }>;
}
