import Stripe from "stripe";

import { err, ok } from "@nimara/domain/objects/Result";

import { API_VERSION, META_KEY } from "../../consts";
import type {
  CustomerFromGatewayGetInfra,
  PaymentServiceConfig,
} from "../../types";

export const customerFromGatewayGetInfra =
  ({ secretKey, logger }: PaymentServiceConfig): CustomerFromGatewayGetInfra =>
  async (opts) => {
    let customer;

    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    if (opts.gatewayId) {
      customer = await stripe.customers.retrieve(opts.gatewayId);
    } else if (opts.user) {
      /**
       * Lookup by Saleor id & environment. Environment will allow us to use same Stripe
       * account for different Saleor backends like dev & staging.
       */
      customer = (
        await stripe.customers.search({
          query: `metadata['${META_KEY.SALEOR_ID}']:'${opts.user.id}' AND metadata['${META_KEY.ENVIRONMENT}']:'${opts.environment}'`,
          limit: 1,
        })
      ).data?.[0];

      if (!customer) {
        /**
         * Lookup by email & environment.
         */
        customer = (
          await stripe.customers.search({
            query: `email:'${opts.user.email}' AND metadata['${META_KEY.ENVIRONMENT}']:'${opts.environment}'`,
            limit: 1,
          })
        )?.data?.[0];
      }
    }

    if (!customer) {
      logger.error("Customer not found", {
        userId: opts.user?.id,
        email: opts.user?.email,
        environment: opts.environment,
      });

      return err([{ code: "CUSTOMER_NOT_FOUND_ERROR" }]);
    }

    return ok({
      id: customer.id,
      defaultPaymentMethodId: null,
    });
  };
