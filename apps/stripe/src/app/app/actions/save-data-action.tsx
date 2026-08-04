"use server";

import { headers } from "next/headers";

import { isError } from "@/lib/error";
import { resolveDashboardTenant } from "@/lib/saleor/config/context";
import { type SaleorAppConfig } from "@/lib/saleor/config/schema";
import { SaleorDomainNotAllowedError } from "@/lib/saleor/error";
import { getStripeApi } from "@/lib/stripe/api";
import { installWebhooks, uninstallWebhooks } from "@/lib/stripe/webhooks/util";
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
  const updatedPaymentGatewayConfig: SaleorAppConfig["paymentGatewayConfig"] =
    {};

  /*
    Read once per key, since channels sharing a key share the account. A key
    without permission to read it leaves the id out; the webhooks then ask
    Stripe themselves.
  */
  const accountIds = new Map<string, string | undefined>();
  const resolveAccountId = async (secretKey: string) => {
    if (!accountIds.has(secretKey)) {
      try {
        accountIds.set(
          secretKey,
          (await getStripeApi(secretKey).accounts.retrieve()).id,
        );
      } catch (err) {
        logger.warning("Failed to read the Stripe account id.", {
          errors: isError(err) ? [{ message: err.message }] : [],
        });
        accountIds.set(secretKey, undefined);
      }
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
      paymentGatewayConfig: updatedPaymentGatewayConfig,
      appUrl,
      logger,
      saleorDomain,
    });
    // Install one webhook per Stripe account, shared by its channels.
    await installWebhooks({
      paymentGatewayConfig: updatedPaymentGatewayConfig,
      appUrl,
      logger,
      saleorDomain,
    });
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
