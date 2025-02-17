import { type TransactionChargeRequestedSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";
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
  mapStatusToActionType,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export const POST =
  verifySaleorWebhookRoute<TransactionChargeRequestedSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();

      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

      if (!event.transaction?.sourceObject) {
        logger.error(
          "Could not process transaction TransactionChargeRequested.",
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
      const intent = await stripe.paymentIntents.capture(
        event.transaction.pspReference,
        {
          amount_to_capture: getCentsFromAmount(
            event.transaction.sourceObject.total.gross,
          ),
        },
      );

      const result = mapStatusToActionType({
        actionType: event.action.actionType,
        status: intent.status,
      });

      let eventData: Partial<TransactionEventSchema> = {
        pspReference: intent.id,
      };

      if (["CHARGE_SUCCESS", "CHARGE_FAILURE"].includes(result)) {
        eventData = {
          ...eventData,
          result,
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
          "Failed to construct TransactionChargeRequested event response.";

        logger.error(message, { errors: eventResult.error.issues });

        return responseError({
          description: message,
          errors: eventResult.error.issues,
          status: 422,
        });
      }

      logger.debug("Constructed TransactionChargeRequested event response.", {
        eventResult,
      });

      return transactionResponseSuccess(eventResult.data);
    },
  );
