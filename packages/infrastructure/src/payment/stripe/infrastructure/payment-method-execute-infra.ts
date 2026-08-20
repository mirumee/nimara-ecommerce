import { err, ok } from "@nimara/domain/objects/Result";

import { handleStripeErrors } from "../../helpers";
import type { PaymentServiceConfig } from "../../types";
import { STRIPE_REDISPLAY_CONSENT } from "../consts";
import type { StripePaymentMethodExecuteInfra } from "../types";

export const paymentMethodExecuteInfra =
  ({ logger }: PaymentServiceConfig): StripePaymentMethodExecuteInfra =>
  async ({ initializeData, methodSession, paymentElement, redirectUrl }) => {
    const { error: submitError } = await paymentElement.submit();

    if (submitError) {
      logger.warning("Payment elements submit failed.", {
        originalError: {
          code: submitError.code,
          message: submitError.message,
          type: submitError.type,
        },
      });

      return err(handleStripeErrors(submitError));
    }

    const { error } = await initializeData.sdk.confirmSetup({
      clientSecret: methodSession.providerData.clientSecret,
      elements: paymentElement,
      redirect: "if_required",
      confirmParams: {
        return_url: redirectUrl,
        /**
         * Saving from the account area is the shopper explicitly asking to
         * reuse this method later — see {@link STRIPE_REDISPLAY_CONSENT}.
         */
        payment_method_data: { allow_redisplay: STRIPE_REDISPLAY_CONSENT },
      },
    });

    if (error) {
      logger.error("Payment method save failed.", {
        originalError: {
          code: error.code,
          message: error.message,
          type: error.type,
        },
        redirectUrl,
      });

      return err(handleStripeErrors(error));
    }

    /**
     * `if_required` leaves Stripe.js to redirect only when the method demands
     * it, so reaching here means the setup settled in place.
     */
    return ok({ nextAction: null });
  };
