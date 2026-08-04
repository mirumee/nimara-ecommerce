import { type PaymentMethodInitializeTokenizationSessionSubscription } from "@/graphql/subscriptions/generated";
import { resolveAppConfigForChannel } from "@/lib/saleor/config/context";
import { tokenizationResponse } from "@/lib/saleor/payment-method/util";
import { verifySaleorWebhookRoute } from "@/lib/saleor/webhooks/api";
import { resolveStripeAccountId } from "@/lib/stripe/account";
import { getStripeApi, stripeRouteErrorsHandler } from "@/lib/stripe/api";
import { STRIPE_SETUP_USAGE } from "@/lib/stripe/const";
import { resolveGatewayCustomerId } from "@/lib/stripe/customer";
import { getGatewayMetadata } from "@/lib/stripe/util";
import { getLoggingProvider } from "@/providers/logging";
import { getSaleorClient } from "@/providers/saleor";

export const POST = stripeRouteErrorsHandler(
  verifySaleorWebhookRoute<PaymentMethodInitializeTokenizationSessionSubscription>(
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

      const { authToken, gatewayConfig } = config;
      const stripe = getStripeApi(gatewayConfig.secretKey);

      const customerId = await resolveGatewayCustomerId({
        accountId: await resolveStripeAccountId({ gatewayConfig, stripe }),
        channelSlug,
        logger,
        saleorClient: getSaleorClient({ authToken, logger, saleorDomain }),
        saleorDomain,
        stripe,
        user: event.user,
      });

      const setupIntent = await stripe.setupIntents.create({
        automatic_payment_methods: { enabled: true },
        customer: customerId,
        metadata: getGatewayMetadata({
          channelSlug,
          saleorDomain,
          saleorUserId: event.user.id,
        }),
        usage: STRIPE_SETUP_USAGE,
      });

      logger.info("Created setup intent for tokenization.", {
        channelSlug,
        setupIntentId: setupIntent.id,
        userId: event.user.id,
      });

      /**
       * The card is collected and confirmed in the storefront against this
       * secret; the resulting payment method is only known once the process
       * step runs.
       */
      return tokenizationResponse({
        data: {
          publishableKey: gatewayConfig.publicKey,
          setupIntent: { clientSecret: setupIntent.client_secret },
        },
        id: setupIntent.id,
        result: "ADDITIONAL_ACTION_REQUIRED",
      });
    },
  ),
);
