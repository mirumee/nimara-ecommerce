import { serverEnvs } from "@/envs/server";

export type MarketplaceCompletedOrder = {
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  sourceCheckoutId: string;
};

export type MarketplaceFailedCheckout = {
  checkoutId: string;
  code: string;
  message: string;
};

export type MarketplaceRollbackOrder = {
  orderId: string;
  sourceCheckoutId: string;
};

export type MarketplaceRollbackFailure = {
  code: string;
  message: string;
  orderId: string;
  sourceCheckoutId: string;
};

export type CheckoutCompleteResponse = {
  completedOrders: MarketplaceCompletedOrder[];
  failedCheckouts: MarketplaceFailedCheckout[];
  rollbackFailures?: MarketplaceRollbackFailure[];
  rolledBackOrders?: MarketplaceRollbackOrder[];
};

type PaymentIntentsResponse = {
  amount: number;
  clientSecret: string;
  currency: string;
  orders: Array<{
    amount: number;
    currency: string;
    orderId: string;
  }>;
  paymentIntentId: string;
  transferGroup: string;
};

const getPocBaseUrl = () => {
  if (!serverEnvs.POC_STRIPE_MARKETPLACE_URL) {
    throw new Error(
      "POC_STRIPE_MARKETPLACE_URL is required when MARKETPLACE_MODE=true",
    );
  }

  return serverEnvs.POC_STRIPE_MARKETPLACE_URL;
};

const postJson = async <T>(path: string, body: Record<string, unknown>) => {
  const url = new URL(path, getPocBaseUrl());
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as T;

  return {
    ok: response.ok,
    status: response.status,
    data: payload,
  };
};

export const checkoutCompleteMarketplace = (checkoutIds: string[]) =>
  postJson<CheckoutCompleteResponse>("/api/payments/checkout-complete", {
    checkoutIds,
  });

export const createMarketplacePaymentIntent = ({
  buyerId,
  orders,
}: {
  buyerId: string;
  orders: Array<{
    amount: number;
    currency: string;
    orderId: string;
  }>;
}) =>
  postJson<PaymentIntentsResponse>("/api/payments/payment-intents", {
    buyerId,
    orders,
  });
