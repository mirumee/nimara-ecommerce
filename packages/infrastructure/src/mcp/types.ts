import { type PageInfo } from "#root/use-cases/search/types";
import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

export type ProductFeedItem = {};

export type ProductFeed = Array<ProductFeedItem>;

export type CheckoutSessionId = string;

export type CheckoutSession = {
  id: CheckoutSessionId;
  lineItems: Array<{
    productId: string;
    quantity: number;
  }>;
  totalAmount: number;
};

export type GetProductFeedArgs = {
  channel: string;
  limit: number;
  page?: string;
  after?: string;
  before?: string;
};

export type CheckoutSessionCreateInput = {
  items: Array<{
    id: string;
    quantity: number;
  }>;
};

/**
 * @description ACPService defines the interface for interacting with a Agentic Commerce Protocol (ACP).
 * @link https://www.agenticcommerce.dev/
 * @link https://developers.openai.com/commerce/specs/checkout
 */
export interface ACPService {
  completeCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
  }) => AsyncResult<{ orderId: string }>;
  createCheckoutSession: (args: {
    input: CheckoutSessionCreateInput;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  updateCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
    data: unknown;
  }) => AsyncResult<{ checkoutSession: CheckoutSession }>;
  getProductFeed: (args: GetProductFeedArgs) => AsyncResult<{
    pageInfo: PageInfo;
    products: ProductFeed;
  }>;
}
