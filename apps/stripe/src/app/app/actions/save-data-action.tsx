"use server";

import { verifyJWTSignature } from "@/lib/saleor/auth/jwt";
import { type SaleorAppConfig } from "@/lib/saleor/config/schema";
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

  const configProvider = getConfigProvider({ saleorDomain: domain });
  const storedPaymentGatewayConfig =
    (
      await configProvider.getBySaleorDomain({
        saleorDomain: domain,
      })
    )?.paymentGatewayConfig ?? {};

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
