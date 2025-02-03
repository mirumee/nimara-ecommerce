"use server";

import { headers } from "next/headers";

import { verifyJWTSignature } from "@/lib/saleor/auth/jwt";
import { type SaleorAppConfig } from "@/lib/saleor/config/schema";
import { installWebhook, uninstallWebhook } from "@/lib/stripe/webhooks/util";
import { getConfigProvider } from "@/providers/config";
import { getJWKSProvider } from "@/providers/jwks";

import { type Schema } from "../schema";

export const saveDataAction = async ({
  data,
  accessToken,
  domain,
}: {
  accessToken: string;
  data: Schema;
  domain: string;
}) => {
  const jwksProvider = getJWKSProvider();

  try {
    await verifyJWTSignature({ jwksProvider, jwt: accessToken });
  } catch {
    return "Failed to verify JWT signature.";
  }

  const appUrl = (await headers()).get("origin");
  const configProvider = getConfigProvider({ saleorDomain: domain });
  const appConfig = await configProvider.getBySaleorDomain({
    saleorDomain: domain,
  });

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
        uninstallWebhook({
          configuration: config,
          appUrl,
        }),
      ),
    );
    // Install new webhooks.
    await Promise.all(
      Object.values(updatedPaymentGatewayConfig).map(async (config) =>
        installWebhook({
          configuration: config,
          appUrl,
        }),
      ),
    );
  }

  try {
    await configProvider.updatePaymentGatewayConfigBySaleorDomain({
      saleorDomain: domain,
      data: updatedPaymentGatewayConfig,
    });
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }

    return "Failed to save configuration.";
  }
};
