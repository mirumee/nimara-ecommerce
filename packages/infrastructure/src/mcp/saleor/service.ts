import { ok } from "@nimara/domain/objects/Result";
import { type MCPService } from "../types";
import { getProductFeedInfra } from "./infrastructure/get-product-feed";

export const saleorMcpService = () =>
  ({
    completeCheckoutSession: async ({ checkoutSessionId }) => {
      return { orderId: checkoutSessionId };
    },
    createCheckoutSession: async () => {
      return { checkoutSessionId: "checkout-session-id" };
    },
    getCheckoutSession: async ({ checkoutSessionId }) => {
      return { checkoutSessionId };
    },
    updateCheckoutSession: async ({ checkoutSessionId }) => {
      return { checkoutSessionId };
    },
    getProductFeed: async (args) => {
      return getProductFeedInfra(args);
    }
  }) satisfies MCPService;
