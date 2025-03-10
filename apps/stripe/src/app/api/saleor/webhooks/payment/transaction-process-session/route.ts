import { type TransactionProcessSessionSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";
import { isError } from "@/lib/error";
import { type TransactionEventSchema } from "@/lib/saleor/transaction/schema";
import { constructTransactionEventResponse } from "@/lib/saleor/transaction/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import {
  getGatewayMetadata,
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<TransactionProcessSessionSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

      logger.debug("TransactionProcessSessionSubscription", { event });

      try {
        gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
          saleorDomain: headers["saleor-domain"],
          channelSlug: event.sourceObject.channel.slug,
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
      const extraMetadata = (
        event.data as { metadata?: Record<string, string> }
      )?.metadata;
      let intent;

      if (event.data) {
        intent = await stripe.paymentIntents.update(
          event.transaction.pspReference,
          {
            ...(event.data as {}),
            amount: getCentsFromAmount(event.sourceObject.total.gross),
            currency: event.sourceObject.total.gross.currency,
            capture_method:
              event.action.actionType === "CHARGE" ? "automatic" : "manual",
            metadata: getGatewayMetadata({
              saleorDomain,
              transactionId: event.transaction.id,
              channelSlug: event.sourceObject.channel.slug,
              ...extraMetadata,
            }),
          },
        );
      } else {
        intent = await stripe.paymentIntents.retrieve(
          event.transaction.pspReference,
        );
      }

      const result = mapStatusToActionType({
        actionType: event.action.actionType,
        status: intent.status,
      });

      const data: TransactionEventSchema = {
        pspReference: intent.id,
        result,
        amount: getAmountFromCents({
          currency: intent.currency,
          amount: intent.amount,
        }),
        message: intent.last_payment_error?.code,
        data: {
          paymentIntent: {
            clientSecret: intent.client_secret,
            publishableKey: gatewayConfig.publicKey,
            time: intent.created,
            externalUrl: getIntentDashboardUrl({
              paymentId: intent.id,
              secretKey: gatewayConfig.secretKey,
            }),
          },
        },
      };

      return constructTransactionEventResponse({
        data,
        logger,
        type: "TransactionProcessSession",
      });
    },
  ),
);
