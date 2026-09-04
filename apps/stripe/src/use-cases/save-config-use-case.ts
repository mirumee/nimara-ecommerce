import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";

import {
  emptyPaymentGatewayConfigSet,
  type PaymentGatewayConfig,
  type PaymentGatewayConfigSet,
} from "@/domain/app-config";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { resolveStripeAccountId } from "@/infrastructure/utils";
import { installWebhooks, uninstallWebhooks } from "@/infrastructure/webhooks";

type GatewayConfigInput = { publicKey: string; secretKey: string };

const allConfigs = (configSet: PaymentGatewayConfigSet) =>
  [configSet.default, ...Object.values(configSet.channelOverrides)].filter(
    (config): config is PaymentGatewayConfig => !!config,
  );

/**
 * An endpoint belongs to the Stripe account, not the channel that introduced
 * it, so anything still using that secret key keeps the endpoint it already has.
 */
export const carryOverWebhooks = ({
  stored,
  updated,
}: {
  stored: PaymentGatewayConfig[];
  updated: PaymentGatewayConfig[];
}) => {
  const installed = new Map(
    stored
      .filter(
        ({ webhookId, webhookSecretKey }) => webhookId && webhookSecretKey,
      )
      .map((config) => [config.secretKey, config]),
  );

  updated.forEach((config) => {
    const endpoint = installed.get(config.secretKey);

    if (endpoint) {
      config.webhookId = endpoint.webhookId;
      config.webhookSecretKey = endpoint.webhookSecretKey;
    }
  });
};

// Secret keys this installation used before the save and no longer does.
export const droppedSecretKeys = ({
  stored,
  updated,
}: {
  stored: PaymentGatewayConfig[];
  updated: PaymentGatewayConfig[];
}) => {
  const kept = new Set(updated.map(({ secretKey }) => secretKey));

  return [...new Set(stored.map(({ secretKey }) => secretKey))].filter(
    (secretKey) => !kept.has(secretKey),
  );
};

// Only the accounts that gained or lost this installation are touched.
const syncWebhooks = async ({
  appId,
  appUrl,
  environment,
  logger,
  saleorDomain,
  stored,
  updated,
}: {
  appId: string;
  appUrl: string;
  environment: string;
  logger: Logger;
  saleorDomain: string;
  stored: PaymentGatewayConfig[];
  updated: PaymentGatewayConfig[];
}) => {
  const secretKeys = droppedSecretKeys({ stored, updated });

  if (secretKeys.length) {
    await uninstallWebhooks({
      appId,
      appUrl,
      environment,
      logger,
      saleorDomain,
      secretKeys,
    });
  }

  const configs = updated.filter(({ webhookId }) => !webhookId);

  if (configs.length) {
    await installWebhooks({
      appId,
      appUrl,
      configs,
      environment,
      logger,
      saleorDomain,
    });
  }
};

/**
 * Turns submitted form values into the config stored for one channel: looks up
 * the Stripe account id, and keeps the saved secret key when the field is blank.
 */
const gatewayConfigResolver = ({ logger }: { logger: Logger }) => {
  const accountIds = new Map<string, string | undefined>();

  return async (
    { publicKey, secretKey }: GatewayConfigInput,
    stored: PaymentGatewayConfig | null | undefined,
  ): Promise<PaymentGatewayConfig> => {
    const resolvedSecretKey = secretKey || stored?.secretKey || "";

    if (!accountIds.has(resolvedSecretKey)) {
      accountIds.set(
        resolvedSecretKey,
        await resolveStripeAccountId({ logger, secretKey: resolvedSecretKey }),
      );
    }

    return {
      accountId: accountIds.get(resolvedSecretKey),
      publicKey,
      secretKey: resolvedSecretKey,
    };
  };
};

export const saveConfigUseCase =
  ({
    appConfigService,
    appId,
    environment,
    logger,
  }: {
    appConfigService: AppConfigService;
    appId: string;
    environment: string;
    logger: Logger;
  }) =>
  async ({
    appUrl,
    data,
    saleorDomain,
  }: {
    appUrl: string | null;
    data: {
      channelOverrides: Record<string, GatewayConfigInput>;
      default: GatewayConfigInput;
      defaultChannelSlug: string;
    };
    saleorDomain: string;
  }): AsyncResult<true> => {
    const configResult = await appConfigService.getPaymentGatewayConfigSet({
      saleorDomain,
    });

    if (!configResult.ok) {
      return configResult;
    }

    const storedConfig = configResult.data ?? emptyPaymentGatewayConfigSet();
    const storedConfigs = allConfigs(storedConfig);

    const toGatewayConfig = gatewayConfigResolver({ logger });

    const updatedConfig: PaymentGatewayConfigSet = {
      default: await toGatewayConfig(data.default, storedConfig.default),
      defaultChannelSlug: data.defaultChannelSlug,
      channelOverrides: {},
    };

    for (const [channelSlug, config] of Object.entries(data.channelOverrides)) {
      updatedConfig.channelOverrides[channelSlug] = await toGatewayConfig(
        config,
        storedConfig.channelOverrides[channelSlug],
      );
    }

    const updatedConfigs = allConfigs(updatedConfig);

    if (updatedConfigs.some(({ secretKey }) => !secretKey)) {
      return err([
        {
          code: "SALEOR_APP_CONFIG_SAVE_ERROR" as const,
          message: "A channel was saved without a secret key.",
          context: { description: "Enter the secret key." },
          status: 422,
        },
      ]);
    }

    carryOverWebhooks({
      stored: storedConfigs,
      updated: updatedConfigs,
    });

    if (appUrl) {
      await syncWebhooks({
        appId,
        appUrl,
        environment,
        logger,
        saleorDomain,
        stored: storedConfigs,
        updated: updatedConfigs,
      });
    }

    const updateResult = await appConfigService.updatePaymentGatewayConfigSet({
      saleorDomain,
      data: updatedConfig,
    });

    if (!updateResult.ok) {
      return updateResult;
    }

    return ok(true);
  };
