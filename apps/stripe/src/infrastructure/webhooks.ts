import { type Logger } from "@nimara/infrastructure/logging/types";
import { isLocalDomain } from "@nimara/lib/utils/url";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import {
  STRIPE_API_VERSION,
  StripeMetaKey,
  StripeWebhookEvent,
} from "@/domain/consts";
import { buildGatewayMetadata } from "@/domain/event-mapping";

import { getStripeApi } from "./utils";

// One URL per installation; every configured Stripe account posts to it.
export const getStripeWebhookUrl = ({
  appUrl,
  saleorDomain,
}: {
  appUrl: string;
  saleorDomain: string;
}) => `${appUrl}/api/stripe/webhooks/${encodeURIComponent(saleorDomain)}`;

/**
 * Endpoints belong to the Stripe account, so configs sharing a secret key
 * share one and each keeps its signing secret.
 */
const configsBySecretKey = (configs: PaymentGatewayConfig[]) =>
  configs.reduce<Map<string, PaymentGatewayConfig[]>>((grouped, config) => {
    if (!config.secretKey) {
      return grouped;
    }

    return grouped.set(config.secretKey, [
      ...(grouped.get(config.secretKey) ?? []),
      config,
    ]);
  }, new Map());

export const installWebhooks = async ({
  appId,
  appUrl,
  configs,
  environment,
  logger,
  saleorDomain,
}: {
  appId: string;
  appUrl: string;
  configs: PaymentGatewayConfig[];
  environment: string;
  logger: Logger;
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
    [...configsBySecretKey(configs)].map(async ([secretKey, shared]) => {
      const result = await getStripeApi(secretKey).webhookEndpoints.create({
        url,
        description: "Created by the Nimara Stripe ts app.",
        enabled_events: Object.values(StripeWebhookEvent),
        // Without this Stripe delivers events in the account's own API version.
        api_version: STRIPE_API_VERSION,
        metadata: buildGatewayMetadata({
          appId,
          environment,
          metadata: { saleorDomain },
        }),
      });

      if (result) {
        shared.forEach((config) => {
          config.webhookId = result.id;
          config.webhookSecretKey = result.secret;
        });
      }
    }),
  );
};

/**
 * Pass only keys the installation dropped, or channels still using the account
 * lose their endpoint.
 */
export const uninstallWebhooks = async ({
  appId,
  appUrl,
  environment,
  logger,
  saleorDomain,
  secretKeys,
}: {
  appId: string;
  appUrl: string;
  environment: string;
  logger: Logger;
  saleorDomain: string;
  secretKeys: string[];
}) => {
  if (!isLocalDomain(appUrl)) {
    await Promise.all(
      secretKeys.filter(Boolean).map(async (secretKey) => {
        const stripe = getStripeApi(secretKey);

        try {
          const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

          /**
           * Several Saleor domains may share one Stripe account, and each owns
           * only the endpoints carrying its own domain.
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
          // The secret key must never reach the logs; the domain locates the tenant.
          logger.error("Could not delete stripe webhooks.", { saleorDomain });
        }
      }),
    );
  }
};
