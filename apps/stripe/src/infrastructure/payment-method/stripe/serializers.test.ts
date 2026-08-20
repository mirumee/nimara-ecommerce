import type Stripe from "stripe";
import { describe, expect, it } from "vitest";

import {
  getDefaultPaymentMethodId,
  serializeStoredPaymentMethod,
} from "./serializers";

const buildCardPaymentMethod = (id = "pm_card"): Stripe.PaymentMethod =>
  ({
    id,
    allow_redisplay: "always",
    type: "card",
    card: {
      brand: "visa",
      exp_month: 12,
      exp_year: 2030,
      last4: "4242",
    },
  }) as unknown as Stripe.PaymentMethod;

describe("serializers", () => {
  describe("serializeStoredPaymentMethod", () => {
    it("should map a card onto the stored payment method shape", () => {
      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: null,
        paymentMethod: buildCardPaymentMethod(),
      });

      // then
      expect(result).toEqual({
        creditCardInfo: {
          brand: "visa",
          expMonth: 12,
          expYear: 2030,
          lastDigits: "4242",
        },
        data: { isDefault: false },
        id: "pm_card",
        name: "Visa 4242",
        supportedPaymentFlows: ["INTERACTIVE"],
        type: "card",
      });
    });

    /**
     * `limited` marks a method kept for one transaction only, so offering it
     * again would use it beyond what the shopper agreed to.
     */
    it("should drop a method kept for one transaction only", () => {
      // given
      const paymentMethod = {
        ...buildCardPaymentMethod(),
        allow_redisplay: "limited",
      } as unknown as Stripe.PaymentMethod;

      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: null,
        paymentMethod,
      });

      // then
      expect(result).toBeNull();
    });

    /**
     * `unspecified` covers methods stored outside this app, which carry no
     * record of the shopper agreeing to be shown them again.
     */
    it("should drop a method with no redisplay consent", () => {
      // given
      const paymentMethod = {
        ...buildCardPaymentMethod(),
        allow_redisplay: "unspecified",
      } as unknown as Stripe.PaymentMethod;

      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: null,
        paymentMethod,
      });

      // then
      expect(result).toBeNull();
    });

    it("should flag the customer's default method", () => {
      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: "pm_card",
        paymentMethod: buildCardPaymentMethod(),
      });

      // then
      expect(result?.data).toEqual({ isDefault: true });
    });

    it("should label a PayPal method with the payer e-mail", () => {
      // given
      const paymentMethod = {
        id: "pm_paypal",
        allow_redisplay: "always",
        type: "paypal",
        paypal: { payer_email: "shopper@example.com" },
      } as unknown as Stripe.PaymentMethod;

      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: null,
        paymentMethod,
      });

      // then
      expect(result).toMatchObject({
        id: "pm_paypal",
        name: "shopper@example.com",
        type: "paypal",
      });
      expect(result).not.toHaveProperty("creditCardInfo");
    });

    /**
     * Dropping these would leave the customer with a stored method they can
     * neither see nor delete.
     */
    it("should report a type with no dedicated presentation under its own name", () => {
      // given
      const paymentMethod = {
        id: "pm_sepa",
        allow_redisplay: "always",
        type: "sepa_debit",
        sepa_debit: { last4: "3000" },
      } as unknown as Stripe.PaymentMethod;

      // when
      const result = serializeStoredPaymentMethod({
        defaultPaymentMethodId: null,
        paymentMethod,
      });

      // then
      expect(result).toMatchObject({
        id: "pm_sepa",
        name: "Sepa debit",
        type: "sepa_debit",
      });
      expect(result).not.toHaveProperty("creditCardInfo");
    });
  });

  describe("getDefaultPaymentMethodId", () => {
    it("should read the default method off the expanded customer", () => {
      // given
      const paymentMethods = [
        {
          ...buildCardPaymentMethod(),
          customer: {
            id: "cus_1",
            invoice_settings: { default_payment_method: "pm_default" },
          },
        },
      ] as unknown as Stripe.PaymentMethod[];

      // when
      const result = getDefaultPaymentMethodId(paymentMethods);

      // then
      expect(result).toBe("pm_default");
    });

    it("should return null when the customer was not expanded", () => {
      // given
      const paymentMethods = [
        { ...buildCardPaymentMethod(), customer: "cus_1" },
      ] as unknown as Stripe.PaymentMethod[];

      // when
      const result = getDefaultPaymentMethodId(paymentMethods);

      // then
      expect(result).toBeNull();
    });

    it("should return null for an empty list", () => {
      // when / then
      expect(getDefaultPaymentMethodId([])).toBeNull();
    });
  });
});
