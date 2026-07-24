import Stripe from "stripe";

import { ok } from "@nimara/domain/objects/Result";

import { API_VERSION } from "../../consts";
import type {
  CustomerPaymentMethodValidate,
  LegacyPaymentServiceConfig,
} from "../../types";

export const customerPaymentMethodValidateInfra =
  ({ secretKey }: LegacyPaymentServiceConfig): CustomerPaymentMethodValidate =>
  async ({ customerId, paymentMethodId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return ok({
      isCustomerPaymentMethod: paymentMethod.customer === customerId,
    });
  };
