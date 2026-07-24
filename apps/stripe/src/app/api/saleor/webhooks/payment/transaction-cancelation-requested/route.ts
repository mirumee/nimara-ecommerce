import Stripe from "stripe";

import { type TransactionCancelationRequestedSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";
import { isError } from "@/lib/error";
import { type TransactionEventSchema } from "@/lib/saleor/transaction/schema";
import { constructTransactionEventResponse } from "@/lib/saleor/transaction/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { getIntentDashboardUrl } from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<TransactionCancelationRequestedSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

      logger.debug("TransactionCancelationRequestedSubscription", { event });

      if (!event.transaction?.sourceObject) {
        logger.error(
          "Could not process transaction TransactionCancelationRequested.",
        );

        return responseError({
          description: "Missing source object information.",
          errors: [],
          status: 422,
        });
      }

      try {
        gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
          saleorDomain: headers["saleor-domain"],
          channelSlug: event.transaction.sourceObject.channel.slug,
        });
      } catch (err) {
        const errors = isError(err) ? [{ message: err.message }] : [];

        return responseError({
          description: "Missing gateway configuration for channel.",
          errors,
          status: 422,
        });
      }

      const stripe = getStripeApi(gatewayConfig.secretKey);

      let intent;

      try {
        intent = await stripe.paymentIntents.cancel(
          event.transaction.pspReference,
        );
      } catch (err) {
        if (!isError(err, Stripe.errors.StripeError)) {
          throw err;
        }

        logger.error("Failed to cancel the payment intent.", {
          pspReference: event.transaction.pspReference,
          originalError: { code: err.code, message: err.message },
        });

        return constructTransactionEventResponse({
          data: {
            pspReference: event.transaction.pspReference,
            result: "CANCEL_FAILURE",
            message: err.message,
          },
          logger,
          type: "TransactionCancelationRequested",
        });
      }

      let data: TransactionEventSchema = {
        pspReference: intent.id,
      };

      if (intent.status === "canceled") {
        data = {
          ...data,
          result: "CANCEL_SUCCESS",
          amount: getAmountFromCents({
            currency: intent.currency,
            amount: intent.amount,
          }),
          externalUrl: getIntentDashboardUrl({
            paymentId: intent.id,
            secretKey: gatewayConfig.secretKey,
          }),
        };
      }

      return constructTransactionEventResponse({
        data,
        logger,
        type: "TransactionCancelationRequested",
      });
    },
  ),
);
