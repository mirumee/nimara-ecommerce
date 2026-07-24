import { invariant } from "graphql/jsutils/invariant";

import { err, ok } from "@nimara/domain/objects/Result";

import { PAYMENT_REDIRECT } from "../../consts";
import type {
  PaymentMethodSaveExecuteInfra,
  StripeServiceState,
} from "../../types";

export const paymentMethodSaveExecuteInfra =
  (serviceState: StripeServiceState): PaymentMethodSaveExecuteInfra =>
  async ({ redirectUrl, saveForFutureUse }) => {
    invariant(serviceState.clientSDK, "Client not initiated.");
    invariant(
      serviceState.paymentElement && serviceState.elements,
      "Payment elements must be initiated when using new payment method.",
    );
    serviceState.paymentElement.update({ readOnly: true });

    const returnUrl = new URL(redirectUrl);

    if (saveForFutureUse) {
      returnUrl.searchParams.append("saveForFutureUse", "true");
    }

    const { error } = await serviceState.clientSDK.confirmSetup({
      elements: serviceState.elements,
      redirect: PAYMENT_REDIRECT as any,
      confirmParams: {
        return_url: returnUrl.toString(),
      },
    });

    serviceState.paymentElement.update({ readOnly: false });

    if (error) {
      /**
       * Stripe will inject errors directly into payment element form.
       */
      if (error.type === "validation_error" || !error.code) {
        return ok({ success: true });
      }

      return err([
        {
          code: "PAYMENT_METHOD_SAVE_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
