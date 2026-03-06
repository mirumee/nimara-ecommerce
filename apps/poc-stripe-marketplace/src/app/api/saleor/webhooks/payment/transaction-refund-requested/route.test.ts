import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifySaleorWebhookSignatureMock, refundsCreateMock } = vi.hoisted(() => ({
  verifySaleorWebhookSignatureMock: vi.fn(),
  refundsCreateMock: vi.fn(),
}));

vi.mock("@/lib/saleor/webhook-signature", () => ({
  verifySaleorWebhookSignature: verifySaleorWebhookSignatureMock,
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: () => ({
    refunds: {
      create: refundsCreateMock,
    },
  }),
}));

import { POST } from "./route";

const rawEventPayload = {
  action: {
    actionType: "REFUND",
    amount: 10.5,
  },
  transaction: {
    id: "txn_1",
    pspReference: "pi_123",
    sourceObject: {
      total: {
        gross: {
          currency: "USD",
        },
      },
    },
  },
};

const wrappedPayload = {
  event: rawEventPayload,
};

const expectedRefundCreateInput = {
  payment_intent: "pi_123",
  amount: 1050,
  idempotencyKey: "refund-txn_1-1050",
  metadata: {
    saleor_transaction_id: "txn_1",
  },
};

const buildSuccessfulRefundResponse = (status: "succeeded" | "pending" | "failed") => ({
  id: "re_123",
  status,
  amount: 1050,
  currency: "usd",
  failure_reason: status === "failed" ? "lost_or_stolen_card" : null,
});

const validHeaders = {
  "saleor-domain": "localhost:8000",
  "saleor-api-url": "http://localhost:8000/graphql/",
  "saleor-signature": "signature",
};

const buildRequest = (payload: unknown) =>
  new Request("http://localhost:3002/api/saleor/webhooks/payment/transaction-refund-requested", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...validHeaders,
    },
    body: JSON.stringify(payload),
  });

describe("saleor transaction-refund-requested webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifySaleorWebhookSignatureMock.mockResolvedValue({
      success: true,
      headers: validHeaders,
    });
  });

  it("returns 400 when signature verification fails", async () => {
    verifySaleorWebhookSignatureMock.mockResolvedValue({
      success: false,
      error: "Invalid Saleor webhook signature.",
    });

    const response = await POST(buildRequest(wrappedPayload));

    expect(response.status).toBe(400);
    expect(refundsCreateMock).not.toHaveBeenCalled();
  });

  it("returns 422 for invalid payload", async () => {
    const invalidPayload = {
      action: {
        actionType: "REFUND",
        amount: 10.5,
      },
      transaction: {
        id: "txn_1",
        sourceObject: {
          total: {
            gross: {
              currency: "USD",
            },
          },
        },
      },
    };

    const response = await POST(buildRequest(invalidPayload));

    expect(response.status).toBe(422);
    expect(refundsCreateMock).not.toHaveBeenCalled();
  });

  it("returns REFUND_SUCCESS for raw event payload", async () => {
    refundsCreateMock.mockResolvedValue(buildSuccessfulRefundResponse("succeeded"));

    const response = await POST(buildRequest(rawEventPayload));
    const data = (await response.json()) as {
      amount: string;
      pspReference: string;
      result: string;
    };

    expect(response.status).toBe(200);
    expect(data).toEqual(
      expect.objectContaining({
        pspReference: "re_123",
        result: "REFUND_SUCCESS",
        amount: "10.50",
      }),
    );
    expect(refundsCreateMock).toHaveBeenCalledWith(expectedRefundCreateInput);
  });

  it("returns REFUND_REQUEST for wrapped event payload", async () => {
    refundsCreateMock.mockResolvedValue(buildSuccessfulRefundResponse("pending"));

    const response = await POST(buildRequest(wrappedPayload));
    const data = (await response.json()) as { result: string };

    expect(response.status).toBe(200);
    expect(data.result).toBe("REFUND_REQUEST");
    expect(refundsCreateMock).toHaveBeenCalledWith(expectedRefundCreateInput);
  });

  it("returns REFUND_FAILURE for failed refund", async () => {
    refundsCreateMock.mockResolvedValue(buildSuccessfulRefundResponse("failed"));

    const response = await POST(buildRequest(rawEventPayload));
    const data = (await response.json()) as { message: string; result: string };

    expect(response.status).toBe(200);
    expect(data.result).toBe("REFUND_FAILURE");
    expect(data.message).toBe("lost_or_stolen_card");
    expect(refundsCreateMock).toHaveBeenCalledWith(expectedRefundCreateInput);
  });
});
