import Stripe from "stripe";

import { API_VERSION } from "../consts";
import type { PaymentMethodDetachInfra, PaymentServiceConfig } from "../types";

export const paymentMethodDetachInfra =
  ({ secretKey }: PaymentServiceConfig): PaymentMethodDetachInfra =>
  async ({ paymentMethodId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    await stripe.paymentMethods.detach(paymentMethodId);
  };
