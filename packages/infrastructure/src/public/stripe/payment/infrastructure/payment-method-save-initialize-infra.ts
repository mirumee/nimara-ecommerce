import Stripe from "stripe";

import { API_VERSION, PAYMENT_USAGE } from "../consts";
import type {
  PaymentSaveInitializeInfra,
  PaymentServiceConfig,
} from "../types";

export const paymentSaveInitializeInfra =
  ({ secretKey }: PaymentServiceConfig): PaymentSaveInitializeInfra =>
  async ({ customerId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const result = await stripe.setupIntents.create({
      customer: customerId,

      automatic_payment_methods: {
        enabled: true,
      },

      usage: PAYMENT_USAGE,
    });

    return { secret: result.client_secret! };
  };
