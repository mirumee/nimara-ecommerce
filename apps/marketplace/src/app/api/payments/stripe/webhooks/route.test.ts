import { type NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const { getAppConfigMock, verifyStripeWebhookSignatureDetailedMock } =
  vi.hoisted(() => ({
    getAppConfigMock: vi.fn(),
    verifyStripeWebhookSignatureDetailedMock: vi.fn(),
  }));

vi.mock("@/lib/stripe/webhook-signature", () => ({
  verifyStripeWebhookSignatureDetailed:
    verifyStripeWebhookSignatureDetailedMock,
}));

vi.mock("@/lib/saleor/app-config", () => ({
  getAppConfig: getAppConfigMock,
}));

vi.mock("@/lib/ledger/link-orders-stripe-charge", () => ({
  linkOrdersToStripeChargeFromPaymentIntent: vi.fn(),
}));

vi.mock("@/services/checkouts", () => ({ checkoutService: {} }));

vi.mock("@/services/transactions", () => ({ transactionsService: {} }));

const createRequest = (metadata: Record<string, string>) =>
  new Request("http://localhost/api/payments/stripe/webhooks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "test-signature",
    },
    body: JSON.stringify({
      id: "evt_1",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", currency: "usd", metadata } },
    }),
  }) as unknown as NextRequest;

describe("route", () => {
  describe("POST", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      verifyStripeWebhookSignatureDetailedMock.mockReturnValue({ ok: true });
    });

    it("skips a PaymentIntent without marketplace checkout metadata", async () => {
      const response = await POST(
        createRequest({
          issuer: "TEST.stripe",
          saleorDomain: "shop.example.com",
          transactionId: "tr_1",
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ status: "skipped" });
      expect(getAppConfigMock).not.toHaveBeenCalled();
    });

    it("rejects a PaymentIntent with incomplete marketplace checkout metadata", async () => {
      const response = await POST(
        createRequest({ subcheckouts: JSON.stringify(["checkout_1"]) }),
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Missing required PaymentIntent metadata.",
      });
    });
  });
});
