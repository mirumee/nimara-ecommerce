import { type TransactionRefundRequestedSubscription } from "@/graphql/subscriptions/generated";
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
  verifySaleorWebhookRoute<TransactionRefundRequestedSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

      logger.debug("TransactionRefundRequestedSubscription", { event });

      if (!event.transaction?.sourceObject) {
        logger.error(
          "Could not process transaction TransactionRefundRequested.",
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

      const intent = await stripe.paymentIntents.retrieve(
        event.transaction.pspReference,
      );

      let data: TransactionEventSchema = {
        pspReference: intent.id,
      };

      if (intent.status === "succeeded") {
        data = {
          ...data,
          amount: getAmountFromCents({
            currency: intent.currency,
            amount: intent.amount,
          }),
          result: "REFUND_SUCCESS",
          externalUrl: getIntentDashboardUrl({
            paymentId: intent.id,
            secretKey: gatewayConfig.secretKey,
          }),
        };
      }

      return constructTransactionEventResponse({
        data,
        logger,
        type: "TransactionRefundRequested",
      });
    },
  ),
);
