import Stripe from "stripe";

import { API_VERSION, QUERY_PARAMS } from "../consts";
import type {
  PaymentMethodSaveProcessInfra,
  PaymentServiceConfig,
} from "../types";

export const paymentMethodSaveProcessInfra =
  ({ secretKey }: PaymentServiceConfig): PaymentMethodSaveProcessInfra =>
  async ({ searchParams }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    if (
      searchParams[QUERY_PARAMS.SETUP_INTENT] &&
      searchParams[QUERY_PARAMS.SAVE_FOR_FUTURE_USE] === "true"
    ) {
      const setupIntent = await stripe.setupIntents.retrieve(
        searchParams[QUERY_PARAMS.SETUP_INTENT],
      );

      if (setupIntent.payment_method && setupIntent.customer) {
        return {
          paymentMethodId: setupIntent.payment_method as string,
          customerId: setupIntent.customer as string,
        };
      }
    }
  };
