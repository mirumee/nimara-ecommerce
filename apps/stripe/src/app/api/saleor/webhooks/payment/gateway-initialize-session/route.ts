import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { transactionResponseSuccess } from "@/lib/saleor/transaction/api";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export const POST =
  verifySaleorWebhookRoute<PaymentGatewayInitializeSessionSubscription>(
    async ({ event, headers }) => {
      const logger = getLoggingProvider();
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

      logger.debug("PaymentGatewayInitializeSessionSubscription", { event });

      try {
        gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
          saleorDomain,
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

      return transactionResponseSuccess({
        data: { publishableKey: gatewayConfig?.publicKey },
      });
    },
  );
