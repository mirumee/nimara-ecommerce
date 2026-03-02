import { createHmac } from "crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAppConfigMock, getOrderTransactionsMock, transactionCreateMock } =
  vi.hoisted(() => ({
    getAppConfigMock: vi.fn(),
    getOrderTransactionsMock: vi.fn(),
    transactionCreateMock: vi.fn(),
  }));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

vi.mock("@/lib/saleor/client", () => ({
  getOrderTransactions: getOrderTransactionsMock,
  transactionCreate: transactionCreateMock,
}));

import { POST } from "./route";

const signingSecret = "whsec_test_123";

const buildStripeSignature = (payload: string) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", signingSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return `t=${timestamp},v1=${digest}`;
};

describe("payments/stripe/webhooks route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAppConfigMock.mockResolvedValue({
      authToken: "token",
      saleorAppId: "app-id",
      saleorDomain: "nimara-local-marketplace.eu.saleor.cloud",
      registeredAt: new Date().toISOString(),
    });
    getOrderTransactionsMock.mockResolvedValue([]);
    transactionCreateMock.mockResolvedValue({
      transaction: { id: "tx_1", name: "PaymentIntent Succeeded" },
      errors: [],
    });
  });

  it("returns 400 for invalid signature", async () => {
    const request = new Request("http://localhost:3002/api/payments/stripe/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=123,v1=invalid",
      },
      body: JSON.stringify({ type: "payment_intent.succeeded" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 200 skipped for unsupported event", async () => {
    const payload = JSON.stringify({ type: "payment_intent.created" });

    const request = new Request("http://localhost:3002/api/payments/stripe/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": buildStripeSignature(payload),
      },
      body: payload,
    });

    const response = await POST(request);
    const data = (await response.json()) as { status: string };

    expect(response.status).toBe(200);
    expect(data.status).toBe("skipped");
  });

  it("creates transactions for all suborders", async () => {
    const payload = JSON.stringify({
      id: "evt_123",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_123",
          currency: "usd",
          metadata: {
            suborders: JSON.stringify(["ord_1", "ord_2"]),
            order_amounts: JSON.stringify({ ord_1: 20, ord_2: 30 }),
          },
        },
      },
    });

    const request = new Request("http://localhost:3002/api/payments/stripe/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": buildStripeSignature(payload),
      },
      body: payload,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(transactionCreateMock).toHaveBeenCalledTimes(2);
  });

  it("skips transactionCreate when already charged transaction exists", async () => {
    getOrderTransactionsMock.mockResolvedValue([
      {
        id: "tx_existing",
        pspReference: "pi_123",
        chargedAmount: { amount: 20, currency: "USD" },
      },
    ]);

    const payload = JSON.stringify({
      id: "evt_123",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_123",
          currency: "usd",
          metadata: {
            suborders: JSON.stringify(["ord_1"]),
            order_amounts: JSON.stringify({ ord_1: 20 }),
          },
        },
      },
    });

    const request = new Request("http://localhost:3002/api/payments/stripe/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": buildStripeSignature(payload),
      },
      body: payload,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(transactionCreateMock).not.toHaveBeenCalled();
  });
});
