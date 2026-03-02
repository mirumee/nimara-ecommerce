import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAppConfigMock,
  transactionCreateMock,
  paymentIntentsCreateMock,
} = vi.hoisted(() => ({
  getAppConfigMock: vi.fn(),
  transactionCreateMock: vi.fn(),
  paymentIntentsCreateMock: vi.fn(),
}));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

vi.mock("@/lib/saleor/client", () => ({
  transactionCreate: transactionCreateMock,
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({
    paymentIntents: {
      create: paymentIntentsCreateMock,
    },
  }),
}));

import { POST } from "./route";

describe("payments/payment-intents route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAppConfigMock.mockResolvedValue({
      authToken: "token",
      saleorAppId: "app-id",
      saleorDomain: "nimara-local-marketplace.eu.saleor.cloud",
      registeredAt: new Date().toISOString(),
    });
    transactionCreateMock.mockResolvedValue({
      transaction: { id: "tx_1", name: "PaymentIntent created" },
      errors: [],
    });
  });

  it("returns 422 for mixed currencies", async () => {
    const request = new Request("http://localhost:3002/api/payments/payment-intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: [
          { orderId: "ord_1", amount: 20, currency: "USD" },
          { orderId: "ord_2", amount: 10, currency: "EUR" },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(422);
    expect(paymentIntentsCreateMock).not.toHaveBeenCalled();
  });

  it("creates payment intent and initial transactions", async () => {
    paymentIntentsCreateMock.mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret",
    });

    const request = new Request("http://localhost:3002/api/payments/payment-intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyerId: "buyer_1",
        orders: [
          { orderId: "ord_1", amount: 20, currency: "USD" },
          { orderId: "ord_2", amount: 30, currency: "USD" },
        ],
      }),
    });

    const response = await POST(request);
    const data = (await response.json()) as { clientSecret: string; paymentIntentId: string };

    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe("pi_123_secret");
    expect(data.paymentIntentId).toBe("pi_123");
    expect(paymentIntentsCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5000,
        currency: "usd",
        metadata: expect.objectContaining({
          suborders: JSON.stringify(["ord_1", "ord_2"]),
          order_amounts: JSON.stringify({ ord_1: 20, ord_2: 30 }),
        }),
        idempotencyKey: expect.stringMatching(/^pi-/),
      }),
    );
    expect(transactionCreateMock).toHaveBeenCalledTimes(2);
  });

  it("returns 500 if transactionCreate fails", async () => {
    paymentIntentsCreateMock.mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret",
    });
    transactionCreateMock.mockResolvedValue({
      transaction: null,
      errors: [{ code: "INVALID", field: "id", message: "Order not found" }],
    });

    const request = new Request("http://localhost:3002/api/payments/payment-intents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: [{ orderId: "ord_1", amount: 20, currency: "USD" }],
      }),
    });

    const response = await POST(request);
    const data = (await response.json()) as { paymentIntentId: string };

    expect(response.status).toBe(500);
    expect(data.paymentIntentId).toBe("pi_123");
  });
});
