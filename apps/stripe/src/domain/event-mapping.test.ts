import { describe, expect, it } from "vitest";

import {
  StripeMetaKey,
  type StripeNotification,
  type SupportedStripeWebhookEventType,
} from "./consts";
import {
  getIntentDashboardUrl,
  isAppEvent,
  mapStatusToActionType,
  mapStripeEventToSaleorEvent,
} from "./event-mapping";

const APP = {
  appId: "app_123",
  environment: "production",
};

// Minimal normalized notification; the gateway is what maps raw Stripe events.
const notification = (
  overrides: Partial<StripeNotification>,
): StripeNotification => ({
  amount: 0,
  currency: "usd",
  id: "evt_1",
  isManualCapture: false,
  lastErrorCode: null,
  metadata: {},
  objectId: "pi_1",
  refundStatus: null,
  type: "payment_intent.succeeded",
  ...overrides,
});

describe("event-mapping", () => {
  describe("isAppEvent", () => {
    it("should return true when issuer and environment match", () => {
      // given
      const metadata = {
        [StripeMetaKey.ISSUER]: APP.appId,
        [StripeMetaKey.ENVIRONMENT]: APP.environment,
      };

      // when
      const result = isAppEvent({ ...APP, metadata });

      // then
      expect(result).toBe(true);
    });

    it("should return false when issuer does not match", () => {
      // given
      const metadata = {
        [StripeMetaKey.ISSUER]: "wrong_app",
        [StripeMetaKey.ENVIRONMENT]: APP.environment,
      };

      // when
      const result = isAppEvent({ ...APP, metadata });

      // then
      expect(result).toBe(false);
    });

    it("should return false when environment does not match", () => {
      // given
      const metadata = {
        [StripeMetaKey.ISSUER]: APP.appId,
        [StripeMetaKey.ENVIRONMENT]: "wrong_env",
      };

      // when
      const result = isAppEvent({ ...APP, metadata });

      // then
      expect(result).toBe(false);
    });

    it("should return false when metadata is missing", () => {
      // when
      const result = isAppEvent({ ...APP, metadata: {} });

      // then
      expect(result).toBe(false);
    });
  });

  describe("mapStripeEventToSaleorEvent", () => {
    it("maps payment_intent.succeeded to CHARGE_SUCCESS regardless of capture method", () => {
      // when / then
      expect(
        mapStripeEventToSaleorEvent(
          notification({
            type: "payment_intent.succeeded",
            isManualCapture: true,
          }),
        )?.type,
      ).toBe("CHARGE_SUCCESS");
      expect(
        mapStripeEventToSaleorEvent(
          notification({
            type: "payment_intent.succeeded",
            isManualCapture: false,
          }),
        )?.type,
      ).toBe("CHARGE_SUCCESS");
    });

    it("maps payment_intent.processing with manual capture to AUTHORIZATION_REQUEST", () => {
      // given
      const event = notification({
        type: "payment_intent.processing",
        isManualCapture: true,
      });

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result?.type).toBe("AUTHORIZATION_REQUEST");
    });

    it("maps payment_intent.payment_failed with manual capture to AUTHORIZATION_FAILURE", () => {
      // given
      const event = notification({
        type: "payment_intent.payment_failed",
        isManualCapture: true,
      });

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result?.type).toBe("AUTHORIZATION_FAILURE");
    });

    it("maps payment_intent.canceled to CANCEL_SUCCESS", () => {
      // given
      const event = notification({ type: "payment_intent.canceled" });

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result?.type).toBe("CANCEL_SUCCESS");
    });

    it("maps payment_intent.requires_action with automatic capture to CHARGE_ACTION_REQUIRED", () => {
      // given
      const event = notification({
        type: "payment_intent.requires_action",
        isManualCapture: false,
      });

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result?.type).toBe("CHARGE_ACTION_REQUIRED");
    });

    it.each([
      { refundStatus: "succeeded", expected: "REFUND_SUCCESS" },
      { refundStatus: "pending", expected: "REFUND_REQUEST" },
      { refundStatus: "requires_action", expected: "REFUND_REQUEST" },
      { refundStatus: "canceled", expected: "REFUND_FAILURE" },
      { refundStatus: "failed", expected: "REFUND_FAILURE" },
    ] as const)(
      "maps charge.refund.updated with $refundStatus refund to $expected",
      ({ refundStatus, expected }) => {
        // given
        const event = notification({
          type: "charge.refund.updated",
          refundStatus,
        });

        // when
        const result = mapStripeEventToSaleorEvent(event);

        // then
        expect(result?.type).toBe(expected);
      },
    );

    it("returns null for unhandled event types", () => {
      // given
      const event = notification({
        type: "unknown.event" as SupportedStripeWebhookEventType,
      });

      // when / then
      expect(mapStripeEventToSaleorEvent(event)).toBeNull();
    });

    it("returns null for charge.refund.updated without a refund status", () => {
      // given
      const event = notification({
        type: "charge.refund.updated",
        refundStatus: null,
      });

      // when / then
      expect(mapStripeEventToSaleorEvent(event)).toBeNull();
    });
  });

  describe("getIntentDashboardUrl", () => {
    it("returns test dashboard URL when using test secretKey", () => {
      // given
      const paymentId = "pi_123456";
      const secretKey = "sk_test_abcdef";

      // when
      const result = getIntentDashboardUrl({ paymentId, secretKey });

      // then
      expect(result).toBe(
        "https://dashboard.stripe.com/test/payments/pi_123456",
      );
    });

    it("returns live dashboard URL when using production secretKey", () => {
      // given
      const paymentId = "pi_654321";
      const secretKey = "sk_live_abcdef";

      // when
      const result = getIntentDashboardUrl({ paymentId, secretKey });

      // then
      expect(result).toBe("https://dashboard.stripe.com/payments/pi_654321");
    });
  });

  describe("mapStatusToActionType", () => {
    it("maps 'processing' status to '_REQUEST'", () => {
      expect(
        mapStatusToActionType({ actionType: "CHARGE", status: "processing" }),
      ).toBe("CHARGE_REQUEST");
    });

    it("maps 'requires_payment_method' status to '_ACTION_REQUIRED'", () => {
      expect(
        mapStatusToActionType({
          actionType: "AUTHORIZATION",
          status: "requires_payment_method",
        }),
      ).toBe("AUTHORIZATION_ACTION_REQUIRED");
    });

    it("maps 'requires_action' status to '_ACTION_REQUIRED'", () => {
      expect(
        mapStatusToActionType({
          actionType: "CHARGE",
          status: "requires_action",
        }),
      ).toBe("CHARGE_ACTION_REQUIRED");
    });

    it("maps 'requires_confirmation' status to '_ACTION_REQUIRED'", () => {
      expect(
        mapStatusToActionType({
          actionType: "AUTHORIZATION",
          status: "requires_confirmation",
        }),
      ).toBe("AUTHORIZATION_ACTION_REQUIRED");
    });

    it("maps 'canceled' status to '_FAILURE'", () => {
      expect(
        mapStatusToActionType({ actionType: "CHARGE", status: "canceled" }),
      ).toBe("CHARGE_FAILURE");
    });

    it("maps 'succeeded' status to '_SUCCESS'", () => {
      expect(
        mapStatusToActionType({
          actionType: "AUTHORIZATION",
          status: "succeeded",
        }),
      ).toBe("AUTHORIZATION_SUCCESS");
    });

    it("maps 'requires_capture' status to 'AUTHORIZATION_SUCCESS'", () => {
      expect(
        mapStatusToActionType({
          actionType: "CHARGE",
          status: "requires_capture",
        }),
      ).toBe("AUTHORIZATION_SUCCESS");
    });

    it("throws an error for an unknown status", () => {
      expect(() =>
        mapStatusToActionType({
          actionType: "CHARGE",
          status: "unknown_status" as never,
        }),
      ).toThrow();
    });
  });
});
