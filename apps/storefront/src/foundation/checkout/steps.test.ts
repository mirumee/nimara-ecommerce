import { describe, expect, it } from "vitest";

import { type Checkout } from "@nimara/domain/objects/Checkout";

import {
  getFirstIncompleteCheckoutStep,
  isCheckoutStepReachable,
  resolveCheckoutStep,
} from "./steps";

const buildCheckout = (
  overrides: Partial<
    Pick<
      Checkout,
      "deliveryMethod" | "email" | "isShippingRequired" | "shippingAddress"
    >
  > = {},
) => ({
  deliveryMethod: null,
  email: null,
  isShippingRequired: true,
  shippingAddress: null,
  ...overrides,
});

const anAddress = {} as NonNullable<Checkout["shippingAddress"]>;
const aDeliveryMethod = {} as NonNullable<Checkout["deliveryMethod"]>;

const emptyCheckout = buildCheckout();
const withEmail = buildCheckout({ email: "shopper@example.com" });
const withShippingAddress = buildCheckout({
  email: "shopper@example.com",
  shippingAddress: anAddress,
});
const completeCheckout = buildCheckout({
  deliveryMethod: aDeliveryMethod,
  email: "shopper@example.com",
  shippingAddress: anAddress,
});
const digitalCheckout = buildCheckout({
  email: "shopper@example.com",
  isShippingRequired: false,
});

describe("resolveCheckoutStep", () => {
  it.each(["user-details", "shipping-address", "delivery-method", "payment"])(
    "resolves %s",
    (step) => {
      expect(resolveCheckoutStep(step)).toBe(step);
    },
  );

  it.each([undefined, null, "", "PAYMENT", "checkout", "../payment"])(
    "rejects %s",
    (step) => {
      expect(resolveCheckoutStep(step)).toBeNull();
    },
  );
});

describe("getFirstIncompleteCheckoutStep", () => {
  it("asks for user details first", () => {
    expect(getFirstIncompleteCheckoutStep(emptyCheckout)).toBe("user-details");
  });

  it("asks for a shipping address once the email is known", () => {
    expect(getFirstIncompleteCheckoutStep(withEmail)).toBe("shipping-address");
  });

  it("asks for a delivery method once the address is known", () => {
    expect(getFirstIncompleteCheckoutStep(withShippingAddress)).toBe(
      "delivery-method",
    );
  });

  it("lands on payment once shipping is settled", () => {
    expect(getFirstIncompleteCheckoutStep(completeCheckout)).toBe("payment");
  });

  it("skips shipping on a checkout that does not need it", () => {
    expect(getFirstIncompleteCheckoutStep(digitalCheckout)).toBe("payment");
  });
});

describe("isCheckoutStepReachable", () => {
  it("blocks payment on a checkout with no address and no delivery method", () => {
    expect(
      isCheckoutStepReachable({ checkout: withEmail, step: "payment" }),
    ).toBe(false);
  });

  it("blocks delivery method before the address is given", () => {
    expect(
      isCheckoutStepReachable({ checkout: withEmail, step: "delivery-method" }),
    ).toBe(false);
  });

  it("blocks every later step before the email is given", () => {
    expect(
      isCheckoutStepReachable({
        checkout: emptyCheckout,
        step: "shipping-address",
      }),
    ).toBe(false);
    expect(
      isCheckoutStepReachable({ checkout: emptyCheckout, step: "payment" }),
    ).toBe(false);
  });

  it("allows payment on a complete checkout", () => {
    expect(
      isCheckoutStepReachable({ checkout: completeCheckout, step: "payment" }),
    ).toBe(true);
  });

  it("allows going back to an answered step", () => {
    expect(
      isCheckoutStepReachable({
        checkout: completeCheckout,
        step: "user-details",
      }),
    ).toBe(true);
    expect(
      isCheckoutStepReachable({
        checkout: completeCheckout,
        step: "shipping-address",
      }),
    ).toBe(true);
  });

  it("allows payment on a checkout that needs no shipping", () => {
    expect(
      isCheckoutStepReachable({ checkout: digitalCheckout, step: "payment" }),
    ).toBe(true);
  });

  it("blocks shipping steps that a checkout without shipping never renders", () => {
    expect(
      isCheckoutStepReachable({
        checkout: digitalCheckout,
        step: "shipping-address",
      }),
    ).toBe(false);
    expect(
      isCheckoutStepReachable({
        checkout: digitalCheckout,
        step: "delivery-method",
      }),
    ).toBe(false);
  });
});
