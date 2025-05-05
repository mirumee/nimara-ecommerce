import type { StripeElementLocale } from "@stripe/stripe-js";
import { invariant } from "graphql/jsutils/invariant";

import type {
  PaymentElementCreateInfra,
  StripeServiceState,
} from "../../types";

const mapToStripeLocale: Record<string, StripeElementLocale> = {
  "en-US": "en",
};

export const paymentElementCreateInfra =
  (state: StripeServiceState): PaymentElementCreateInfra =>
  async ({ secret, locale = "auto" }) => {
    invariant(state.clientSDK, "Stripe client not initialized.");

    state.elements = state.clientSDK.elements({
      clientSecret: secret,
      locale: mapToStripeLocale[locale] ?? locale,
    });

    const paymentElement = state.elements.create("payment", {
      layout: {
        type: "accordion",
        radios: false,
      },
    });

    state.paymentElement = paymentElement;

    const mount = (targetSelector: string) => {
      paymentElement.mount(targetSelector);
    };

    const unmount = () => {
      paymentElement.unmount();
    };

    return {
      mount,
      unmount,
    };
  };
