import { CONFIG } from "@/config";
import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { type Logger } from "@/providers/logging";

import * as api from "../api";
import { getStripeApi } from "../api";
import { StripeMetaKey } from "../const";

const isLocalDomain = (url: string) => {
  const urlObject = new URL(url);

  return ["localhost", "127.0.0.1"].includes(urlObject.hostname);
};

export const installWebhook = async ({
  configuration,
  appUrl,
  logger,
  saleorDomain,
}: {
  appUrl: string;
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

  const url = `${appUrl}/api/stripe/webhooks`;
  const result = await api.webhookSubscribe({
    apiKey: configuration.secretKey,
    url,
    saleorDomain,
  });

  if (result) {
    configuration.webhookId = result.id;
    configuration.webhookSecretKey = result.id;
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
  const stripe = getStripeApi(configuration.secretKey);

  if (!isLocalDomain(appUrl)) {
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
