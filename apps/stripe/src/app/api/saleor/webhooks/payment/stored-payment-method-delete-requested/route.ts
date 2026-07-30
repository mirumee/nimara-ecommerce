import Stripe from "stripe";

import { type StoredPaymentMethodDeleteRequestedSubscription } from "@/graphql/subscriptions/generated";
import { isError } from "@/lib/error";
import { resolveAppConfigForChannel } from "@/lib/saleor/config/context";
import { deleteResponse } from "@/lib/saleor/payment-method/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { findGatewayCustomerId } from "@/lib/stripe/customer";
import { getExpandableId } from "@/lib/stripe/payment-method";
import { getLoggingProvider } from "@/providers/logging";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<StoredPaymentMethodDeleteRequestedSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();

      const saleorDomain = headers["saleor-domain"];
      const channelSlug = event.channel.slug;
      const { paymentMethodId } = event;
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

      if (!customerId) {
        logger.warning("Delete requested for a user without a customer.", {
          channelSlug,
          paymentMethodId,
          userId: event.user.id,
        });

        return deleteResponse({
          error: "No gateway customer for this user.",
          result: "FAILED_TO_DELETE",
        });
      }

      try {
        const paymentMethod =
          await stripe.paymentMethods.retrieve(paymentMethodId);

        /**
         * Saleor does not enforce that the method belongs to the requesting
         * user, so ownership is checked here before detaching.
         */
        if (getExpandableId(paymentMethod.customer) !== customerId) {
          logger.warning("Delete requested for a foreign payment method.", {
            channelSlug,
            paymentMethodId,
            userId: event.user.id,
          });

          return deleteResponse({
            error: "Payment method does not belong to this user.",
            result: "FAILED_TO_DELETE",
          });
        }

        await stripe.paymentMethods.detach(paymentMethodId);
      } catch (err) {
        if (
          isError(err, Stripe.errors.StripeInvalidRequestError) &&
          err.code === "resource_missing"
        ) {
          logger.warning("Payment method no longer exists in Stripe.", {
            channelSlug,
            paymentMethodId,
            userId: event.user.id,
          });

          return deleteResponse({
            error: "Payment method does not exist.",
            result: "FAILED_TO_DELETE",
          });
        }

        throw err;
      }

      logger.info("Deleted stored payment method.", {
        channelSlug,
        paymentMethodId,
        userId: event.user.id,
      });

      return deleteResponse({ result: "SUCCESSFULLY_DELETED" });
    },
  ),
);
