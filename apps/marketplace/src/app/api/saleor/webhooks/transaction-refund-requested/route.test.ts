import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const {
  createRefundMock,
  getStripeClientMock,
  verifySaleorWebhookSignatureMock,
} = vi.hoisted(() => ({
  createRefundMock: vi.fn(),
  getStripeClientMock: vi.fn(),
  verifySaleorWebhookSignatureMock: vi.fn(),
}));

vi.mock("@/lib/saleor/webhook-signature", () => ({
  verifySaleorWebhookSignature: verifySaleorWebhookSignatureMock,
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: getStripeClientMock,
}));

function createWebhookRequest(payload: unknown): Request {
  return new Request(
    "http://localhost/api/saleor/webhooks/transaction-refund-requested",
    {
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
        "saleor-api-url": "https://example.saleor.cloud/graphql/",
        "saleor-domain": "example.saleor.cloud",
        "saleor-event": "TRANSACTION_REFUND_REQUESTED",
        "saleor-signature": "signature",
      },
      method: "POST",
    },
  );
}

const refundEventPayload = {
  action: {
    actionType: "REFUND",
    amount: 12.34,
  },
  transaction: {
    id: "txn-1",
    pspReference: "pi_123",
    sourceObject: {
      total: {
        gross: {
          currency: "usd",
        },
      },
    },
  },
};

const originalStripeSecretKey = process.env.STRIPE_SECRET_KEY;

describe("transaction-refund-requested webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.STRIPE_SECRET_KEY = "sk_test_123";

    verifySaleorWebhookSignatureMock.mockResolvedValue({ success: true });
    getStripeClientMock.mockReturnValue({
      refunds: {
        create: createRefundMock,
      },
    });
    createRefundMock.mockResolvedValue({
      amount: 1234,
      currency: "usd",
      failure_reason: null,
      id: "re_1",
      status: "succeeded",
    });
  });

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = originalStripeSecretKey;
  });

  it("returns REFUND_SUCCESS for succeeded Stripe refund", async () => {
    const response = await POST(createWebhookRequest(refundEventPayload) as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(createRefundMock).toHaveBeenCalledWith({
      payment_intent: "pi_123",
      amount: 1234,
      idempotencyKey: "refund-txn-1-1234",
      metadata: {
        saleor_transaction_id: "txn-1",
      },
    });
    expect(data).toEqual({
      amount: "12.34",
      externalUrl: "https://dashboard.stripe.com/test/refunds/re_1",
      message: null,
      pspReference: "re_1",
      result: "REFUND_SUCCESS",
    });
  });

  it("returns 400 when Saleor webhook signature is invalid", async () => {
    verifySaleorWebhookSignatureMock.mockResolvedValue({
      success: false,
      error: "Invalid Saleor webhook signature.",
      details: { message: "Invalid signature" },
    });

    const response = await POST(createWebhookRequest(refundEventPayload) as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Invalid Saleor webhook signature.",
      details: { message: "Invalid signature" },
    });
    expect(createRefundMock).not.toHaveBeenCalled();
  });

  it("returns 422 for invalid webhook payload", async () => {
    const response = await POST(createWebhookRequest({ invalid: true }) as never);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe("Invalid Saleor refund webhook payload.");
    expect(createRefundMock).not.toHaveBeenCalled();
  });

  it("returns 500 when Stripe refund creation fails", async () => {
    createRefundMock.mockRejectedValue(new Error("Stripe refund failed"));

    const response = await POST(createWebhookRequest(refundEventPayload) as never);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Failed to process Stripe refund.",
      details: { message: "Stripe refund failed" },
    });
  });

  it.each([
    { status: "pending", expected: "REFUND_REQUEST" },
    { status: "requires_action", expected: "REFUND_REQUEST" },
    { status: "failed", expected: "REFUND_FAILURE" },
    { status: "canceled", expected: "REFUND_FAILURE" },
  ])(
    "maps Stripe status $status to $expected",
    async ({ expected, status }) => {
      createRefundMock.mockResolvedValue({
        amount: 1234,
        currency: "usd",
        failure_reason: null,
        id: "re_status",
        status,
      });

      const response = await POST(
        createWebhookRequest(refundEventPayload) as never,
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result).toBe(expected);
    },
  );
});
