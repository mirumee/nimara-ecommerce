import { type Checkout } from "@nimara/domain/objects/Checkout";

export const CHECKOUT_STEPS_MAP = {
  DELIVERY_METHOD: "delivery-method",
  PAYMENT: "payment",
  SHIPPING_ADDRESS: "shipping-address",
  USER_DETAILS: "user-details",
} as const;

export const CHECKOUT_STEPS = Object.values(CHECKOUT_STEPS_MAP);

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

/**
 * The order the shopper walks.
 */
const CHECKOUT_STEPS_SEQUENCE: readonly CheckoutStep[] = [
  CHECKOUT_STEPS_MAP.USER_DETAILS,
  CHECKOUT_STEPS_MAP.SHIPPING_ADDRESS,
  CHECKOUT_STEPS_MAP.DELIVERY_METHOD,
  CHECKOUT_STEPS_MAP.PAYMENT,
];

type CheckoutStepsCompletion = Pick<
  Checkout,
  "deliveryMethod" | "email" | "isShippingRequired" | "shippingAddress"
>;

export const resolveCheckoutStep = (
  step: string | null | undefined,
): CheckoutStep | null =>
  CHECKOUT_STEPS.includes(step as CheckoutStep) ? (step as CheckoutStep) : null;

export const getFirstIncompleteCheckoutStep = (
  checkout: CheckoutStepsCompletion,
): CheckoutStep => {
  if (checkout.email === null) {
    return CHECKOUT_STEPS_MAP.USER_DETAILS;
  }

  if (!checkout.isShippingRequired) {
    return CHECKOUT_STEPS_MAP.PAYMENT;
  }

  if (checkout.shippingAddress === null) {
    return CHECKOUT_STEPS_MAP.SHIPPING_ADDRESS;
  }

  if (checkout.deliveryMethod === null) {
    return CHECKOUT_STEPS_MAP.DELIVERY_METHOD;
  }

  return CHECKOUT_STEPS_MAP.PAYMENT;
};

export const isCheckoutStepReachable = ({
  checkout,
  step,
}: {
  checkout: CheckoutStepsCompletion;
  step: CheckoutStep;
}): boolean => {
  const isShippingStep =
    step === CHECKOUT_STEPS_MAP.SHIPPING_ADDRESS ||
    step === CHECKOUT_STEPS_MAP.DELIVERY_METHOD;

  if (!checkout.isShippingRequired && isShippingStep) {
    return false;
  }

  return (
    CHECKOUT_STEPS_SEQUENCE.indexOf(step) <=
    CHECKOUT_STEPS_SEQUENCE.indexOf(getFirstIncompleteCheckoutStep(checkout))
  );
};
