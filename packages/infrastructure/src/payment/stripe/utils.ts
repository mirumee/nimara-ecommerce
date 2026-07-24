import { loadStripe as loadStripeJS, type Stripe } from "@stripe/stripe-js";

let sdkPromise: Promise<Stripe | null> | null = null;

/**
 * Loads the Stripe.js SDK once and reuses the same instance across calls.
 */
export const loadStripe = (publicKey: string) => {
  if (!sdkPromise) {
    sdkPromise = loadStripeJS(publicKey);
  }

  return sdkPromise;
};
