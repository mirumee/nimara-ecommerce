import { type Logger } from "@nimara/infrastructure/logging/types";

import { CONFIG } from "@/config";
import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { isLocalDomain } from "@/lib/util";

import { getStripeApi } from "../api";
import { StripeMetaKey, StripeWebhookEvent } from "../const";
import { getGatewayMetadata } from "../util";

export const installWebhook = async ({
  configuration,
  appUrl,
  logger,
  saleorDomain,
  channel,
}: {
  appUrl: string;
  channel: string;
  configuration: PaymentGatewayConfig[string];
  logger: Logger;
  saleorDomain: string;
}) => {
  if (!configuration.secretKey) {
    return;
  }

  if (isLocalDomain(appUrl)) {
    logger.warning(
      "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
    );

    return;
  }

  const url = `${appUrl}/api/stripe/${channel}/webhooks`;
  const stripe = getStripeApi(configuration.secretKey);

  const result = await stripe.webhookEndpoints.create({
    url,
    enabled_events: Object.values(StripeWebhookEvent),
    metadata: getGatewayMetadata({ saleorDomain }),
  });

  if (result) {
    configuration.webhookId = result.id;
    configuration.webhookSecretKey = result.secret;
  }
};

export const uninstallWebhooks = async ({
  configuration,
  appUrl,
  logger,
}: {
  appUrl: string;
  configuration: PaymentGatewayConfig[string];
  logger: Logger;
}) => {
  if (!isLocalDomain(appUrl)) {
    const stripe = getStripeApi(configuration.secretKey);

    try {
      const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

      // Filter webhooks by issuer and environment to avoid orphans upon reinstallations.
      const webhooksToDelete = webhooks.data.filter((webhook) => {
        const isIssuedWebhook =
          webhook.metadata[StripeMetaKey.ISSUER] === CONFIG.APP_ID;
        const isSameEnvironment =
          webhook.metadata[StripeMetaKey.ENVIRONMENT] === CONFIG.ENVIRONMENT;

        return isIssuedWebhook && isSameEnvironment;
      });

      await Promise.all(
        webhooksToDelete.map(async (webhook) =>
          stripe.webhookEndpoints.del(webhook.id),
        ),
      );
    } catch {
      logger.error("Could not delete stripe webhook", {
        webhookId: configuration.webhookId,
      });
    }
  }

  configuration.webhookId = undefined;
  configuration.webhookSecretKey = undefined;
};
