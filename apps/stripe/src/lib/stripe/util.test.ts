import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { CONFIG } from "@/config";

import { StripeMetaKey, type SupportedStripeWebhookEvent } from "./const";
import {
  extractPaymentMethodDetails,
  fetchPaymentMethodDetails,
  getIntentDashboardUrl,
  getPaymentIntentReportAmount,
  humanize,
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
    it.each([["manual"], ["automatic"]])(
      "maps payment_intent.succeeded with %s capture to CHARGE_SUCCESS",
      (captureMethod) => {
        // given
        const event = {
          type: "payment_intent.succeeded",
          data: { object: { capture_method: captureMethod } },
        } as SupportedStripeWebhookEvent;

        // when
        const result = mapStripeEventToSaleorEvent(event);

        // then
        expect(result?.type).toBe("CHARGE_SUCCESS");
      },
    );

    it.each([["manual"], ["automatic"]])(
      "maps payment_intent.canceled with %s capture to CANCEL_SUCCESS",
      (captureMethod) => {
        // given
        const event = {
          type: "payment_intent.canceled",
          data: { object: { capture_method: captureMethod } },
        } as SupportedStripeWebhookEvent;

        // when
        const result = mapStripeEventToSaleorEvent(event);

        // then
        expect(result?.type).toBe("CANCEL_SUCCESS");
      },
    );

    it("maps payment_intent.processing with manual capture to AUTHORIZATION_REQUEST", () => {
      // given
      const event = {
        type: "payment_intent.processing",
        data: { object: { capture_method: "manual" } },
      } as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result?.type).toBe("AUTHORIZATION_REQUEST");
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
      expect(result?.type).toBe("AUTHORIZATION_FAILURE");
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
      expect(result?.type).toBe("CHARGE_ACTION_REQUIRED");
    });

    it.each([
      ["succeeded", "REFUND_SUCCESS"],
      ["pending", "REFUND_REQUEST"],
      ["requires_action", "REFUND_REQUEST"],
      ["failed", "REFUND_FAILURE"],
      ["canceled", "REFUND_FAILURE"],
    ])(
      "maps charge.refund.updated with '%s' status to %s",
      (status, expected) => {
        // given
        const event = {
          type: "charge.refund.updated",
          data: { object: { status } },
        } as SupportedStripeWebhookEvent;

        // when
        const result = mapStripeEventToSaleorEvent(event);

        // then
        expect(result?.type).toBe(expected);
      },
    );

    it.each([
      ["payment_intent.created"],
      ["payment_intent.partially_funded"],
      ["charge.refunded"],
      ["unknown.event"],
    ])("returns null for the unsupported event type %s", (type) => {
      // given
      const event = {
        type,
        data: { object: {} },
      } as unknown as SupportedStripeWebhookEvent;

      // when
      const result = mapStripeEventToSaleorEvent(event);

      // then
      expect(result).toBeNull();
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

  describe("getPaymentIntentReportAmount", () => {
    it.each([
      ["requires_capture", 700],
      ["succeeded", 800],
      ["processing", 1000],
      ["requires_action", 1000],
      ["canceled", 1000],
    ])("resolves the amount for the '%s' status", (status, expected) => {
      // given
      const intent = {
        status,
        amount: 1000,
        amount_capturable: 700,
        amount_received: 800,
      } as Stripe.PaymentIntent;

      // when
      const result = getPaymentIntentReportAmount(intent);

      // then
      expect(result).toBe(expected);
    });
  });

  describe("humanize", () => {
    it.each([
      ["card", "Card"],
      ["sepa_debit", "Sepa debit"],
      ["us-bank-account", "Us bank account"],
      ["amazon_pay_wallet", "Amazon pay wallet"],
    ])("humanizes '%s' to '%s'", (value, expected) => {
      // when
      const result = humanize(value);

      // then
      expect(result).toBe(expected);
    });
  });

  describe("extractPaymentMethodDetails", () => {
    it.each([[null], [undefined], ["pm_123"]])(
      "returns undefined for %s",
      (paymentMethod) => {
        // when
        const result = extractPaymentMethodDetails(paymentMethod);

        // then
        expect(result).toBeUndefined();
      },
    );

    it("extracts card details from a card payment method", () => {
      // given
      const paymentMethod = {
        type: "card",
        card: {
          brand: "visa",
          last4: "4242",
          exp_month: 12,
          exp_year: 2030,
        },
      } as Stripe.PaymentMethod;

      // when
      const result = extractPaymentMethodDetails(paymentMethod);

      // then
      expect(result).toStrictEqual({
        card: {
          name: "Visa",
          brand: "visa",
          lastDigits: "4242",
          expMonth: 12,
          expYear: 2030,
        },
      });
    });

    it("falls back to a generic card name when the brand is missing", () => {
      // given
      const paymentMethod = {
        type: "card",
        card: {
          brand: null,
          last4: null,
          exp_month: null,
          exp_year: null,
        },
      } as unknown as Stripe.PaymentMethod;

      // when
      const result = extractPaymentMethodDetails(paymentMethod);

      // then
      expect(result).toStrictEqual({
        card: {
          name: "Card",
          brand: undefined,
          lastDigits: undefined,
          expMonth: undefined,
          expYear: undefined,
        },
      });
    });

    it("extracts a humanized name for a non-card payment method", () => {
      // given
      const paymentMethod = {
        type: "sepa_debit",
      } as Stripe.PaymentMethod;

      // when
      const result = extractPaymentMethodDetails(paymentMethod);

      // then
      expect(result).toStrictEqual({
        other: {
          name: "Sepa debit",
        },
      });
    });
  });

  describe("fetchPaymentMethodDetails", () => {
    it.each([[null], [undefined]])(
      "returns undefined for %s",
      async (paymentMethod) => {
        // given
        const retrieve = vi.fn();
        const api = {
          paymentMethods: { retrieve },
        } as unknown as Stripe;

        // when
        const result = await fetchPaymentMethodDetails(api, paymentMethod);

        // then
        expect(result).toBeUndefined();
        expect(retrieve).not.toHaveBeenCalled();
      },
    );

    it("retrieves the payment method when given an id", async () => {
      // given
      const retrieve = vi.fn().mockResolvedValue({
        type: "card",
        card: {
          brand: "mastercard",
          last4: "4444",
          exp_month: 1,
          exp_year: 2031,
        },
      });
      const api = {
        paymentMethods: { retrieve },
      } as unknown as Stripe;

      // when
      const result = await fetchPaymentMethodDetails(api, "pm_123");

      // then
      expect(retrieve).toHaveBeenCalledWith("pm_123");
      expect(result).toStrictEqual({
        card: {
          name: "Mastercard",
          brand: "mastercard",
          lastDigits: "4444",
          expMonth: 1,
          expYear: 2031,
        },
      });
    });

    it("extracts details directly from an expanded payment method", async () => {
      // given
      const retrieve = vi.fn();
      const api = {
        paymentMethods: { retrieve },
      } as unknown as Stripe;
      const paymentMethod = {
        type: "link",
      } as Stripe.PaymentMethod;

      // when
      const result = await fetchPaymentMethodDetails(api, paymentMethod);

      // then
      expect(retrieve).not.toHaveBeenCalled();
      expect(result).toStrictEqual({
        other: {
          name: "Link",
        },
      });
    });
  });
});
