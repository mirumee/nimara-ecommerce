import { describe, expect, it, vi } from "vitest";

import { CONFIG } from "@/config";

import { StripeMetaKey, type SupportedStripeWebhookEvent } from "./const";
import {
  getIntentDashboardUrl,
  isAppEvent,
  mapStatusToActionType,
  mapStripeEventToSaleorEvent,
} from "./util";

const MOCK_CONFIG = {
  APP_ID: "app_123",
  ENVIRONMENT: "production",
};

describe("util", () => {
  describe("isAppEvent", () => {
    it("should return true when issuer and environment match", async () => {
      // given
      const event = {
        data: {
          object: {
            metadata: {
              [StripeMetaKey.ISSUER]: MOCK_CONFIG.APP_ID,
              [StripeMetaKey.ENVIRONMENT]: MOCK_CONFIG.ENVIRONMENT,
            },
          },
        },
      } as unknown as SupportedStripeWebhookEvent;

      vi.spyOn(CONFIG, "ENVIRONMENT", "get").mockReturnValue(
        MOCK_CONFIG.ENVIRONMENT,
      );
      vi.spyOn(CONFIG, "APP_ID", "get").mockReturnValue(MOCK_CONFIG.APP_ID);

      // when
      const result = isAppEvent(event);

      // then
      expect(result).toBe(true);
    });

    it("should return false when issuer does not match", () => {
      // given
      const event = {
        data: {
          object: {
            metadata: {
              [StripeMetaKey.ISSUER]: "wrong_app",
              [StripeMetaKey.ENVIRONMENT]: MOCK_CONFIG.ENVIRONMENT,
            },
          },
        },
      } as unknown as SupportedStripeWebhookEvent;

      // when
      const result = isAppEvent(event);

      // then
      expect(result).toBe(false);
    });

    it("should return false when environment does not match", () => {
      // given
      const event = {
        data: {
          object: {
            metadata: {
              [StripeMetaKey.ISSUER]: MOCK_CONFIG.APP_ID,
              [StripeMetaKey.ENVIRONMENT]: "wrong_env",
            },
          },
        },
      } as unknown as SupportedStripeWebhookEvent;

      // when
      const result = isAppEvent(event);

      // then
      expect(result).toBe(false);
    });

    it("should return false when metadata is missing", () => {
      // given
      const event = {
        data: {
          object: {},
        },
      } as unknown as SupportedStripeWebhookEvent;

      // when
      const result = isAppEvent(event);

      // then
      expect(result).toBe(false);
    });
  });

  describe("mapStripeEventToSaleorEvent", () => {
    it("maps payment_intent.succeeded with manual capture to AUTHORIZATION_SUCCESS", () => {
      // given
      const event = {
        type: "payment_intent.succeeded",
        data: { object: { capture_method: "manual" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("AUTHORIZATION_SUCCESS");
    });

    it("maps payment_intent.succeeded with automatic capture to CHARGE_SUCCESS", () => {
      // given
      const event = {
        type: "payment_intent.succeeded",
        data: { object: { capture_method: "automatic" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("CHARGE_SUCCESS");
    });

    it("maps payment_intent.processing with manual capture to AUTHORIZATION_REQUEST", () => {
      // given
      const event = {
        type: "payment_intent.processing",
        data: { object: { capture_method: "manual" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("AUTHORIZATION_REQUEST");
    });

    it("maps payment_intent.payment_failed with manual capture to AUTHORIZATION_FAILURE", () => {
      // given
      const event = {
        type: "payment_intent.payment_failed",
        data: { object: { capture_method: "manual" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("AUTHORIZATION_FAILURE");
    });

    it("maps payment_intent.requires_action with automatic capture to CHARGE_ACTION_REQUIRED", () => {
      // given
      const event = {
        type: "payment_intent.requires_action",
        data: { object: { capture_method: "automatic" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("CHARGE_ACTION_REQUIRED");
    });

    it("maps charge.refunded to REFUND_SUCCESS", () => {
      // given
      const event = {
        type: "charge.refunded",
        data: { object: { status: "succeeded" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result.type).toBe("REFUND_SUCCESS");
    });

    it("throws an error for unknown event types", () => {
      // given
      const event = {
        type: "unknown.event",
        data: { object: {} },
      } as unknown as SupportedStripeWebhookEvent;

      // when / then
      expect(() => mapStripeEventToSaleorEvent(event)).toThrow();
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
      // given
      const actionType = "CHARGE";
      const status = "processing";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("CHARGE_REQUEST");
    });

    it("maps 'requires_payment_method' status to '_ACTION_REQUIRED'", () => {
      // given
      const actionType = "AUTHORIZATION";
      const status = "requires_payment_method";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("AUTHORIZATION_ACTION_REQUIRED");
    });

    it("maps 'requires_action' status to '_ACTION_REQUIRED'", () => {
      // given
      const actionType = "CHARGE";
      const status = "requires_action";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("CHARGE_ACTION_REQUIRED");
    });

    it("maps 'requires_confirmation' status to '_ACTION_REQUIRED'", () => {
      // given
      const actionType = "AUTHORIZATION";
      const status = "requires_confirmation";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("AUTHORIZATION_ACTION_REQUIRED");
    });

    it("maps 'canceled' status to '_FAILURE'", () => {
      // given
      const actionType = "CHARGE";
      const status = "canceled";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("CHARGE_FAILURE");
    });

    it("maps 'succeeded' status to '_SUCCESS'", () => {
      // given
      const actionType = "AUTHORIZATION";
      const status = "succeeded";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("AUTHORIZATION_SUCCESS");
    });

    it("maps 'requires_capture' status to 'AUTHORIZATION_SUCCESS'", () => {
      // given
      const actionType = "CHARGE";
      const status = "requires_capture";

      // when
      const result = mapStatusToActionType({ actionType, status });

      // then
      expect(result).toBe("AUTHORIZATION_SUCCESS");
    });

    it("throws an error for an unknown status", () => {
      // given
      const actionType = "CHARGE";
      const status = "unknown_status" as any;

      // when / then
      expect(() => mapStatusToActionType({ actionType, status })).toThrow();
    });
  });
});
