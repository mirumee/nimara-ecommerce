import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";

import { type StripeNotification } from "@/domain/consts";

import { stripeRoutes } from ".";

const mocks = vi.hoisted(() => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
  transactionReport: vi.fn(),
  verifyWebhook: vi.fn(),
}));

vi.mock("@/container", () => ({
  container: {
    get: vi.fn((key: string) => {
      switch (key) {
        case "config":
          return { APP_ID: "TEST.stripe", ENVIRONMENT: "TEST" };
        case "appConfigService":
          return {
            getBySaleorDomain: async () => ok({ authToken: "token" }),
          };
        case "paymentService":
          return async () =>
            ok({
              config: { secretKey: "sk_test_1", webhookSecretKey: "whsec_1" },
              gateway: { verifyWebhook: mocks.verifyWebhook },
            });
        case "saleorClient":
          return () => ({ transactionReport: mocks.transactionReport });
        default:
          throw new Error(`Unexpected container key: ${key}`);
      }
    }),
  },
}));

const SINGLE_METADATA = {
  channelSlug: "default-channel",
  environment: "TEST",
  issuer: "TEST.stripe",
  saleorDomain: "shop.example.com",
  transactionId: "tr_a",
};

const GROUP_METADATA = {
  ...SINGLE_METADATA,
  paymentGroup: "1",
  tx_0: "tr_a|1500",
  tx_1: "tr_b|3000",
  tx_2: "tr_c|500",
};

const notification = (
  overrides: Partial<StripeNotification> = {},
): StripeNotification => ({
  amount: 5000,
  currency: "usd",
  id: "evt_1",
  isManualCapture: false,
  lastErrorCode: null,
  metadata: GROUP_METADATA,
  objectId: "pi_1",
  refundStatus: null,
  type: "payment_intent.succeeded",
  ...overrides,
});

const app = new Hono()
  .use(async (context, next) => {
    context.set("logger" as never, mocks.logger as never);
    await next();
  })
  .route("/", stripeRoutes);

const post = (event: StripeNotification) => {
  mocks.verifyWebhook.mockResolvedValue(ok(event));

  return app.request("/webhooks/shop.example.com", {
    method: "POST",
    headers: { "stripe-signature": "t=1,v1=sig" },
    body: JSON.stringify({
      id: event.id,
      data: { object: { metadata: event.metadata } },
    }),
  });
};

const reportedShares = () =>
  mocks.transactionReport.mock.calls.map(([variables]) => ({
    amount: variables.amount,
    availableActions: variables.availableActions,
    pspReference: variables.pspReference,
    transactionId: variables.transactionId,
    type: variables.type,
  }));

describe("index", () => {
  describe("stripeRoutes", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mocks.transactionReport.mockResolvedValue(ok({ errors: [] }));
    });

    it("reports a single-checkout PaymentIntent to its own transaction", async () => {
      const response = await post(
        notification({ amount: 1500, metadata: SINGLE_METADATA }),
      );

      expect(response.status).toBe(200);
      expect(mocks.transactionReport).toHaveBeenCalledTimes(1);
      expect(mocks.transactionReport).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: "15.00",
          transactionId: "tr_a",
          type: "CHARGE_SUCCESS",
        }),
      );
    });

    it("reports every share of a group with its own amount", async () => {
      const response = await post(notification());

      expect(response.status).toBe(200);
      expect(reportedShares()).toEqual([
        {
          amount: "15.00",
          availableActions: ["REFUND"],
          pspReference: "pi_1",
          transactionId: "tr_a",
          type: "CHARGE_SUCCESS",
        },
        {
          amount: "30.00",
          availableActions: ["REFUND"],
          pspReference: "pi_1",
          transactionId: "tr_b",
          type: "CHARGE_SUCCESS",
        },
        {
          amount: "5.00",
          availableActions: ["REFUND"],
          pspReference: "pi_1",
          transactionId: "tr_c",
          type: "CHARGE_SUCCESS",
        },
      ]);
    });

    it("reports a failed group payment without available actions", async () => {
      await post(notification({ type: "payment_intent.payment_failed" }));

      expect(reportedShares()).toEqual(
        ["tr_a", "tr_b", "tr_c"].map((transactionId) =>
          expect.objectContaining({
            availableActions: [],
            transactionId,
            type: "CHARGE_FAILURE",
          }),
        ),
      );
    });

    it("skips a group event that is not reported per share", async () => {
      const response = await post(
        notification({ type: "payment_intent.requires_action" }),
      );

      expect(response.status).toBe(200);
      expect(mocks.transactionReport).not.toHaveBeenCalled();
    });

    it("reports nothing when the shares do not add up to the amount", async () => {
      const response = await post(notification({ amount: 4999 }));

      expect(response.status).toBe(200);
      expect(mocks.transactionReport).not.toHaveBeenCalled();
      expect(mocks.logger.error).toHaveBeenCalledWith(
        "Group payment shares do not add up to the event amount.",
        expect.objectContaining({ amount: 4999, sharesTotal: 5000 }),
      );
    });

    it("reports nothing when the group metadata is malformed", async () => {
      const response = await post(
        notification({ metadata: { ...GROUP_METADATA, tx_1: "tr_b" } }),
      );

      expect(response.status).toBe(200);
      expect(mocks.transactionReport).not.toHaveBeenCalled();
    });

    it("keeps reporting the other shares when Saleor refuses one", async () => {
      mocks.transactionReport.mockImplementation(async ({ transactionId }) =>
        ok({
          errors:
            transactionId === "tr_b"
              ? [{ code: "INCORRECT_DETAILS", message: "Mismatch." }]
              : [],
        }),
      );

      const response = await post(notification());

      expect(response.status).toBe(200);
      expect(mocks.transactionReport).toHaveBeenCalledTimes(3);
      expect(mocks.logger.error).toHaveBeenCalledWith(
        "Failed to report a group payment share to Saleor.",
        expect.objectContaining({ transactionId: "tr_b" }),
      );
    });

    it("asks Stripe to redeliver when a share cannot reach Saleor", async () => {
      mocks.transactionReport.mockImplementation(async ({ transactionId }) =>
        transactionId === "tr_c"
          ? err([
              { code: "HTTP_ERROR", message: "Saleor is down.", status: 503 },
            ])
          : ok({ errors: [] }),
      );

      const response = await post(notification());

      expect(response.status).toBe(503);
      expect(mocks.transactionReport).toHaveBeenCalledTimes(3);
    });
  });
});
