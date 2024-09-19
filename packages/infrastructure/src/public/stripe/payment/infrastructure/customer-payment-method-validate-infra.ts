import Stripe from "stripe";

import { API_VERSION } from "../consts";
import type {
  CustomerPaymentMethodValidate,
  PaymentServiceConfig,
} from "../types";

export const customerPaymentMethodValidateInfra =
  ({ secretKey }: PaymentServiceConfig): CustomerPaymentMethodValidate =>
  async ({ customerId, paymentMethodId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return {
      isCustomerPaymentMethod: paymentMethod.customer === customerId,
    };
  };
