import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { resolveStripeAccountId } from "@/infrastructure/utils";
import { installWebhooks, uninstallWebhooks } from "@/infrastructure/webhooks";

export const saveConfigUseCase =
  ({
    appConfigService,
    appId,
    environment,
    joseAuthService,
    logger,
  }: {
    appConfigService: AppConfigService;
    appId: string;
    environment: string;
    joseAuthService: (saleorDomain: string) => JoseAuthService;
    logger: Logger;
  }) =>
  async ({
    accessToken,
    appUrl,
    data,
    saleorDomain,
  }: {
    accessToken: string;
    appUrl: string | null;
    data: Record<
      string,
      { currency: string; publicKey: string; secretKey: string }
    >;
    saleorDomain: string;
  }): AsyncResult<true> => {
    const jwtResult =
      await joseAuthService(saleorDomain).verifyJwt(accessToken);

    if (!jwtResult.ok) {
      return jwtResult;
    }

    const configResult = await appConfigService.getPaymentGatewayConfig({
      saleorDomain,
    });

    if (!configResult.ok) {
      return configResult;
    }

    const storedPaymentGatewayConfig = configResult.data ?? {};
    const updatedPaymentGatewayConfig: PaymentGatewayConfig = {};

    // Read once per key, since channels sharing a key share the account.
    const accountIds = new Map<string, string | undefined>();
    const resolveAccountId = async (secretKey: string) => {
      if (!accountIds.has(secretKey)) {
        accountIds.set(
          secretKey,
          await resolveStripeAccountId({ logger, secretKey }),
        );
      }

      return accountIds.get(secretKey);
    };

    for (const [channelSlug, config] of Object.entries(data)) {
      updatedPaymentGatewayConfig[channelSlug] = {
        ...storedPaymentGatewayConfig[channelSlug],
        accountId: await resolveAccountId(config.secretKey),
        currency: config.currency,
        secretKey: config.secretKey,
        publicKey: config.publicKey,
      };
    }

    if (appUrl) {
      // Remove old webhooks in case of configuration change.
      await uninstallWebhooks({
        appId,
        appUrl,
        environment,
        logger,
        paymentGatewayConfig: updatedPaymentGatewayConfig,
        saleorDomain,
      });

      await installWebhooks({
        appId,
        appUrl,
        environment,
        logger,
        paymentGatewayConfig: updatedPaymentGatewayConfig,
        saleorDomain,
      });
    }

    const updateResult = await appConfigService.updatePaymentGatewayConfig({
      saleorDomain,
      data: updatedPaymentGatewayConfig,
    });

    if (!updateResult.ok) {
      return updateResult;
    }

    return ok(true);
  };
