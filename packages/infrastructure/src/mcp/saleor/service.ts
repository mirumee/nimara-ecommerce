import { type MCPService } from "../types";

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
  }) satisfies MCPService;
