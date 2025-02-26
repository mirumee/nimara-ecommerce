import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { transactionResponseSuccess } from "@/lib/saleor/transaction/api";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { getConfigProvider } from "@/providers/config";

export const POST =
  verifySaleorWebhookRoute<PaymentGatewayInitializeSessionSubscription>(
    async ({ event, headers }) => {
      const saleorDomain = headers["saleor-domain"];
      const configProvider = getConfigProvider({ saleorDomain });
      let gatewayConfig;

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
