import { loadStripe as loadStripeJS, type Stripe } from "@stripe/stripe-js";

import { type StripeGatewayConfig } from "./types";

const sdkPromises = new Map<string, Promise<Stripe | null>>();

/**
 * Cached per key, since channels may use different Stripe accounts. No
 * `apiVersion` is passed: the release train Stripe.js ships on rejects it.
 */
export const loadStripe = ({ publishableKey }: StripeGatewayConfig) => {
  const cached = sdkPromises.get(publishableKey);

  if (cached) {
    return cached;
  }

  const sdkPromise = loadStripeJS(publishableKey);

  sdkPromises.set(publishableKey, sdkPromise);

  /**
   * A cached rejection would fail every later attempt on the page.
   */
  void sdkPromise.catch(() => sdkPromises.delete(publishableKey));

  return sdkPromise;
};
