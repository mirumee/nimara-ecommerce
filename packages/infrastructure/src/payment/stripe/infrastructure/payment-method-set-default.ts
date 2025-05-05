import Stripe from "stripe";

import { ok } from "@nimara/domain/objects/Result";

import { API_VERSION } from "../../consts";
import type {
  PaymentMethodSetDefaultInfra,
  PaymentServiceConfig,
} from "../../types";

export const paymentMethodSetDefaultInfra =
  ({ secretKey }: PaymentServiceConfig): PaymentMethodSetDefaultInfra =>
  async ({ paymentMethodId, customerId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return ok({ success: true });
  };
