export const CHECKOUT_STEPS_MAP = {
  DELIVERY_METHOD: "delivery-method",
  PAYMENT: "payment",
  SHIPPING_ADDRESS: "shipping-address",
  USER_DETAILS: "user-details",
} as const;

export const CHECKOUT_STEPS = Object.values(CHECKOUT_STEPS_MAP);

export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export const resolveCheckoutStep = (step: string): CheckoutStep | null => {
  return CHECKOUT_STEPS_MAP[step as keyof typeof CHECKOUT_STEPS_MAP] || null;
};
