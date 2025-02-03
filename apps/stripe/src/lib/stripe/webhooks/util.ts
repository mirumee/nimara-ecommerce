import { loggingService } from "@nimara/infrastructure/logging/service";

import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";

import * as api from "../api";

const isLocalDomain = (url: string) => {
  const urlObject = new URL(url);

  return ["localhost", "127.0.0.1"].includes(urlObject.hostname);
};

export const installWebhook = async ({
  configuration,
  appUrl,
}: {
  appUrl: string;
  configuration: PaymentGatewayConfig[string];
}) => {
  if (!configuration.secretKey) {
    return;
  }

  if (isLocalDomain(appUrl)) {
    loggingService.warning(
      "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
    );

    return;
  }

  const url = `${appUrl}/api/stripe/webhooks`;
  const result = await api.webhookSubscribe({
    apiKey: configuration.secretKey,
    url,
  });

  if (result) {
    configuration.webhookId = result.id;
    configuration.webhookSecretKey = result.id;
  }
};

export const uninstallWebhook = async ({
  configuration,
  appUrl,
}: {
  appUrl: string;
  configuration: PaymentGatewayConfig[string];
}) => {
  if (
    !isLocalDomain(appUrl) &&
    configuration.secretKey &&
    configuration.webhookId
  ) {
    try {
      await api.webhookDelete({
        apiKey: configuration.secretKey,
        id: configuration.webhookId,
      });
    } catch {
      loggingService.error("Could not delete stripe webhook", {
        webhookId: configuration.webhookId,
      });
    }
  }

  configuration.webhookId = undefined;
  configuration.webhookSecretKey = undefined;
};
