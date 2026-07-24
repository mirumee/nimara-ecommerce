import Stripe from "stripe";

import { err, ok } from "@nimara/domain/objects/Result";

import { API_VERSION, PAYMENT_USAGE } from "../../consts";
import type {
  LegacyPaymentServiceConfig,
  PaymentSaveInitializeInfra,
} from "../../types";

export const paymentSaveInitializeInfra =
  ({
    secretKey,
    logger,
  }: LegacyPaymentServiceConfig): PaymentSaveInitializeInfra =>
  async ({ customerId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const result = await stripe.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      usage: PAYMENT_USAGE,
    });

    if (!result.client_secret) {
      logger.error("Failed to create setup intent", {
        errors: result,
        customerId,
      });

      return err([{ code: "CREATE_SETUP_INTENT_ERROR" }]);
    }

    return ok({ secret: result.client_secret });
  };
