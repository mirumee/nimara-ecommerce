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

/**
 * @description MCPService defines the interface for interacting with a Multi-Channel Platform (MCP).
 * @link https://www.agenticcommerce.dev/
 * @link https://developers.openai.com/commerce/specs/checkout
 */
export type MCPService = {
  completeCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
  }) => Promise<{ orderId: string } | null>;
  createCheckoutSession: (
    args: unknown,
  ) => Promise<{ checkoutSessionId: CheckoutSessionId } | null>;
  getCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
  }) => Promise<{
    checkoutSessionId: CheckoutSessionId;
  } | null>;
  updateCheckoutSession: (args: {
    checkoutSessionId: CheckoutSessionId;
    data: unknown;
  }) => Promise<{
    checkoutSessionId: CheckoutSessionId;
  } | null>;
  getProductFeed: (args: GetProductFeedArgs) => AsyncResult<{
    pageInfo: PageInfo
    products: ProductFeed;
  }>;
};
