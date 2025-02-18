import { type TransactionCancelationRequestedSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";
import { isError } from "@/lib/error";
import { transactionResponseSuccess } from "@/lib/saleor/transaction/api";
import {
  type TransactionEventSchema,
  transactionEventSchema,
} from "@/lib/saleor/transaction/schema";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/util";
import { getStripeApi } from "@/lib/stripe/api";
import {
  getIntentDashboardUrl,
  stripeRouteErrorsHandler,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<TransactionCancelationRequestedSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

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

      // TODO: Handle Stripe errors everywhere
      const intent = await stripe.paymentIntents.retrieve(
        event.transaction.pspReference,
      );

      let eventData: Partial<TransactionEventSchema> = {
        pspReference: intent.id,
      };

      if (intent.status === "canceled") {
        eventData = {
          ...eventData,
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

      const eventResult = transactionEventSchema.safeParse(eventData);

      if (!eventResult.success) {
        const message =
          "Failed to construct TransactionCancelationRequested event response.";

        logger.error(message, { errors: eventResult.error.issues });

        return responseError({
          description: message,
          errors: eventResult.error.issues,
          status: 422,
        });
      }

      logger.debug(
        "Constructed TransactionCancelationRequested event response.",
        {
          eventResult,
        },
      );

      return transactionResponseSuccess(eventResult.data);
    },
  ),
);
