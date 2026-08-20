import { type Logger } from "@nimara/infrastructure/logging/types";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import {
  STRIPE_API_VERSION,
  StripeMetaKey,
  StripeWebhookEvent,
} from "@/domain/consts";
import { buildGatewayMetadata } from "@/domain/event-mapping";
import { isLocalDomain } from "@/lib/util";

import { getStripeApi } from "./utils";

// One endpoint per installation serves every channel.
export const getStripeWebhookUrl = ({
  appUrl,
  saleorDomain,
}: {
  appUrl: string;
  saleorDomain: string;
}) => `${appUrl}/api/stripe/webhooks/${encodeURIComponent(saleorDomain)}`;

/**
 * Endpoints belong to a Stripe account, not to a channel, so channels sharing a
 * secret key share one endpoint and each carries its signing secret.
 */
const configurationsBySecretKey = (
  paymentGatewayConfig: PaymentGatewayConfig,
) =>
  Object.values(paymentGatewayConfig).reduce<
    Map<string, PaymentGatewayConfig[string][]>
  >((configurations, configuration) => {
    if (!configuration.secretKey) {
      return configurations;
    }

    const shared = configurations.get(configuration.secretKey) ?? [];

    return configurations.set(configuration.secretKey, [
      ...shared,
      configuration,
    ]);
  }, new Map());

export const installWebhooks = async ({
  appId,
  appUrl,
  environment,
  logger,
  paymentGatewayConfig,
  saleorDomain,
}: {
  appId: string;
  appUrl: string;
  environment: string;
  logger: Logger;
  paymentGatewayConfig: PaymentGatewayConfig;
  saleorDomain: string;
}) => {
  if (isLocalDomain(appUrl)) {
    logger.warning(
      "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
    );

    return;
  }

  const url = getStripeWebhookUrl({ appUrl, saleorDomain });

  await Promise.all(
    [...configurationsBySecretKey(paymentGatewayConfig)].map(
      async ([secretKey, configurations]) => {
        const result = await getStripeApi(secretKey).webhookEndpoints.create({
          url,
          description: "Created by the Nimara Stripe ts app.",
          enabled_events: Object.values(StripeWebhookEvent),
          /**
           * Pins the payload shape of delivered events — without it, Stripe
           * sends events in the account's default API version.
           */
          api_version: STRIPE_API_VERSION,
          metadata: buildGatewayMetadata({
            appId,
            environment,
            metadata: { saleorDomain },
          }),
        });

        if (result) {
          configurations.forEach((configuration) => {
            configuration.webhookId = result.id;
            configuration.webhookSecretKey = result.secret;
          });
        }
      },
    ),
  );
};

export const uninstallWebhooks = async ({
  appId,
  appUrl,
  environment,
  logger,
  paymentGatewayConfig,
  saleorDomain,
}: {
  appId: string;
  appUrl: string;
  environment: string;
  logger: Logger;
  paymentGatewayConfig: PaymentGatewayConfig;
  saleorDomain: string;
}) => {
  if (!isLocalDomain(appUrl)) {
    await Promise.all(
      [...configurationsBySecretKey(paymentGatewayConfig)].map(
        async ([secretKey, configurations]) => {
          const stripe = getStripeApi(secretKey);

          try {
            const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

            /**
             * Filter by issuer, environment and tenant to avoid orphans upon
             * reinstallations — several Saleor domains may share one Stripe
             * account, and each owns only the endpoints carrying its own
             * domain.
             */
            const webhooksToDelete = webhooks.data.filter((webhook) => {
              const isIssuedWebhook =
                webhook.metadata[StripeMetaKey.ISSUER] === appId;
              const isSameEnvironment =
                webhook.metadata[StripeMetaKey.ENVIRONMENT] === environment;
              const isSameTenant =
                webhook.metadata[StripeMetaKey.SALEOR_DOMAIN] === saleorDomain;

              return isIssuedWebhook && isSameEnvironment && isSameTenant;
            });

            await Promise.all(
              webhooksToDelete.map(async (webhook) =>
                stripe.webhookEndpoints.del(webhook.id),
              ),
            );
          } catch {
            logger.error("Could not delete stripe webhook", {
              webhookIds: configurations.map(
                (configuration) => configuration.webhookId,
              ),
            });
          }
        },
      ),
    );
  }

  Object.values(paymentGatewayConfig).forEach((configuration) => {
    configuration.webhookId = undefined;
    configuration.webhookSecretKey = undefined;
  });
};
