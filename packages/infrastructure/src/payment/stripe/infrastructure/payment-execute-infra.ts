import { err, ok } from "@nimara/domain/objects/Result";

import { PAYMENT_REDIRECT, QUERY_PARAMS } from "../../consts";
import { handleStripeErrors } from "../../helpers";
import type { PaymentServiceConfig } from "../../types";
import { STRIPE_REDISPLAY_CONSENT } from "../consts";
import type { StripePaymentExecuteInfra } from "../types";

export const paymentExecuteInfra =
  ({ logger }: PaymentServiceConfig): StripePaymentExecuteInfra =>
  async ({
    details,
    initializeData,
    paymentElement,
    redirectUrl,
    transactionData,
  }) => {
    const returnUrl = new URL(redirectUrl);

    if (transactionData.transaction) {
      returnUrl.searchParams.append(
        QUERY_PARAMS.TRANSACTION_ID,
        transactionData.transaction.id,
      );
    }

    if (paymentElement) {
      const { error } = await paymentElement.submit();

      if (error) {
        logger.warning("Payment elements submit failed.", {
          originalError: {
            code: error.code,
            message: error.message,
            type: error.type,
          },
          transactionId: transactionData.transaction?.id ?? null,
        });

        return err(handleStripeErrors(error));
      }
    }

    /**
     * Ticking "save for future use" on a newly entered method is the consent
     * {@link STRIPE_REDISPLAY_CONSENT} records. A stored method already carries
     * its own, so the value is not resent when paying with one.
     */
    const isSavingNewMethod = !!paymentElement && !!details.saveForFutureUse;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { error } = await initializeData.sdk.confirmPayment({
      redirect: PAYMENT_REDIRECT,
      confirmParams: {
        return_url: returnUrl.toString(),
        ...((details.billingDetails || isSavingNewMethod) && {
          payment_method_data: {
            ...(details.billingDetails && {
              billing_details: {
                address: {
                  city: details.billingDetails.city,
                  country: details.billingDetails.country,
                  line1: details.billingDetails.streetAddress1,
                  line2: details.billingDetails.streetAddress2,
                  postal_code: details.billingDetails.postalCode,
                  state: details.billingDetails.countryArea,
                },
                email: details.email,
                name: [
                  details.billingDetails.firstName,
                  details.billingDetails.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
              },
            }),
            ...(isSavingNewMethod && {
              allow_redisplay: STRIPE_REDISPLAY_CONSENT,
            }),
          },
        }),
      },
      /**
       * Confirm with the mounted payment element when paying with a new
       * method; fall back to the session secret alone when confirming a
       * tokenized saved method.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((paymentElement
        ? { elements: paymentElement }
        : { clientSecret: transactionData.providerData.clientSecret }) as any),
    });

    if (error) {
      logger.error("Payment execution failed.", {
        originalError: {
          code: error.code,
          message: error.message,
          type: error.type,
        },
        redirectUrl,
        transactionId: transactionData.transaction?.id ?? null,
      });

      return err(handleStripeErrors(error));
    }

    /**
     * Stripe.js owns navigation for this integration, so a confirmation that
     * returns at all has nothing left for the caller to do.
     */
    return ok({ nextAction: null });
  };
