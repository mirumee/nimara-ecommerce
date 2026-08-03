"use server";

import { headers } from "next/headers";

import { isError } from "@/lib/error";
import { resolveDashboardTenant } from "@/lib/saleor/config/context";
import { type SaleorAppConfig } from "@/lib/saleor/config/schema";
import { SaleorDomainNotAllowedError } from "@/lib/saleor/error";
import { installWebhook, uninstallWebhooks } from "@/lib/stripe/webhooks/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

import { type Schema } from "../schema";

export const saveDataAction = async ({
  data,
  accessToken,
  saleorApiUrl,
}: {
  accessToken: string;
  data: Schema;
  saleorApiUrl: string;
}) => {
  let saleorDomain: string;

  try {
    ({ saleorDomain } = await resolveDashboardTenant({
      accessToken,
      saleorApiUrl,
    }));
  } catch (err) {
    return isError(err, SaleorDomainNotAllowedError)
      ? err.message
      : "Failed to verify JWT signature.";
  }

  const appUrl = (await headers()).get("origin");
  const configProvider = getConfigProvider();
  const appConfig = await configProvider.getBySaleorDomain({
    saleorDomain,
  });
  const logger = getLoggingProvider();

  const storedPaymentGatewayConfig = appConfig?.paymentGatewayConfig ?? {};
  const updatedPaymentGatewayConfig = Object.entries(data).reduce<
    SaleorAppConfig["paymentGatewayConfig"]
  >((acc, [channelSlug, config]) => {
    acc[channelSlug] = {
      ...storedPaymentGatewayConfig[channelSlug],
      currency: config.currency,
      secretKey: config.secretKey,
      publicKey: config.publicKey,
    };

    return acc;
  }, {});

  if (appUrl) {
    // Remove old webhooks in case of configuration change.
    await Promise.all(
      Object.values(updatedPaymentGatewayConfig).map(async (config) =>
        uninstallWebhooks({
          configuration: config,
          appUrl,
          logger,
          saleorDomain,
        }),
      ),
    );
    // Install new webhooks.
    await Promise.all(
      Object.entries(updatedPaymentGatewayConfig).map(
        async ([channel, config]) =>
          installWebhook({
            channel,
            configuration: config,
            appUrl,
            saleorDomain,
            logger,
          }),
      ),
    );
  }

  try {
    await configProvider.updatePaymentGatewayConfig({
      saleorDomain,
      data: updatedPaymentGatewayConfig,
    });
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }

    return "Failed to save configuration.";
  }
};
