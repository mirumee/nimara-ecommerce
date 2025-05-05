import Stripe from "stripe";

import { ok } from "@nimara/domain/objects/Result";

import { API_VERSION, META_KEY } from "../../consts";
import type {
  CustomerInGatewayCreateInfra,
  PaymentServiceConfig,
} from "../../types";

export const customerInGatewayCreateInfra =
  ({ secretKey }: PaymentServiceConfig): CustomerInGatewayCreateInfra =>
  async ({ user, environment }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        [META_KEY.ENVIRONMENT]: environment,
        [META_KEY.SALEOR_ID]: user.id,
      },
    });

    return ok({
      id: customer.id,
      defaultPaymentMethodId: null,
    });
  };
