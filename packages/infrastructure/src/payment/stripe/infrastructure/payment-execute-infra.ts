import { err, ok } from "@nimara/domain/objects/Result";

import { PAYMENT_REDIRECT, QUERY_PARAMS } from "../../consts";
import { handleStripeErrors } from "../../helpers";
import type { PaymentServiceConfig } from "../../types";
import type { PaymentExecuteInfra } from "../types";

export const paymentExecuteInfra =
  ({ logger }: PaymentServiceConfig): PaymentExecuteInfra =>
  async ({ data, initializeData, transactionData }) => {
    const returnUrl = new URL(data.redirectUrl);

    if (transactionData.transaction) {
      returnUrl.searchParams.append(
        QUERY_PARAMS.TRANSACTION_ID,
        transactionData.transaction.id,
      );
    }

    if (data.elements) {
      const { error } = await data.elements.submit();

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { error } = await initializeData.sdk.confirmPayment({
      redirect: PAYMENT_REDIRECT,
      confirmParams: {
        return_url: returnUrl.toString(),
        ...(data.billingDetails && {
          payment_method_data: {
            billing_details: {
              address: {
                city: data.billingDetails.city,
                country: data.billingDetails.country,
                line1: data.billingDetails.streetAddress1,
                line2: data.billingDetails.streetAddress2,
                postal_code: data.billingDetails.postalCode,
                state: data.billingDetails.countryArea,
              },
              email: data.email,
              name: [
                data.billingDetails.firstName,
                data.billingDetails.lastName,
              ]
                .filter(Boolean)
                .join(" "),
            },
          },
        }),
      },
      /**
       * Confirm with the mounted payment element when paying with a new
       * method; fall back to the intent secret alone when confirming a
       * tokenized saved method.
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...((data.elements
        ? { elements: data.elements }
        : { clientSecret: transactionData.clientSecret }) as any),
    });

    if (error) {
      logger.error("Payment execution failed.", {
        originalError: {
          code: error.code,
          message: error.message,
          type: error.type,
        },
        redirectUrl: data.redirectUrl,
        transactionId: transactionData.transaction?.id ?? null,
      });

      return err(handleStripeErrors(error));
    }

    return ok({ success: true });
  };
