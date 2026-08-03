import Stripe from "stripe";

import { type ListStoredPaymentMethodsSubscription } from "@/graphql/subscriptions/generated";
import { isError } from "@/lib/error";
import { resolveAppConfigForChannel } from "@/lib/saleor/config/context";
import { listResponse } from "@/lib/saleor/payment-method/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { findGatewayCustomerId } from "@/lib/stripe/customer";
import {
  getDefaultPaymentMethodId,
  serializeStoredPaymentMethod,
} from "@/lib/stripe/payment-method";
import { getLoggingProvider } from "@/providers/logging";

const FETCH_LIMIT = 50;

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<ListStoredPaymentMethodsSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();

      const saleorDomain = headers["saleor-domain"];
      const channelSlug = event.channel.slug;
      const { config, response } = await resolveAppConfigForChannel({
        channelSlug,
        saleorDomain,
      });

      if (!config) {
        return response;
      }

      const { gatewayConfig } = config;
      const stripe = getStripeApi(gatewayConfig.secretKey);
      const customerId = findGatewayCustomerId({
        channelSlug,
        user: event.user,
      });

      /**
       * Listing must not create a customer — a shopper who never saved a
       * method simply has none.
       */
      if (!customerId) {
        return listResponse();
      }

      let paymentMethods: Stripe.PaymentMethod[];

      try {
        ({ data: paymentMethods } = await stripe.customers.listPaymentMethods(
          customerId,
          {
            /**
             * Expanding the customer carries the default method id along, so
             * flagging it costs no extra call.
             */
            expand: ["data.customer"],
            limit: FETCH_LIMIT,
          },
        ));
      } catch (err) {
        if (
          isError(err, Stripe.errors.StripeInvalidRequestError) &&
          err.code === "resource_missing"
        ) {
          logger.warning("Gateway customer no longer exists in Stripe.", {
            channelSlug,
            customerId,
            userId: event.user.id,
          });

          return listResponse();
        }

        throw err;
      }

      const defaultPaymentMethodId = getDefaultPaymentMethodId(paymentMethods);
      const storedPaymentMethods = paymentMethods
        .map((paymentMethod) =>
          serializeStoredPaymentMethod({
            defaultPaymentMethodId,
            paymentMethod,
          }),
        )
        .filter((paymentMethod) => paymentMethod !== null);

      logger.info("Listed stored payment methods.", {
        channelSlug,
        count: storedPaymentMethods.length,
        userId: event.user.id,
      });

      return listResponse(storedPaymentMethods);
    },
  ),
);
