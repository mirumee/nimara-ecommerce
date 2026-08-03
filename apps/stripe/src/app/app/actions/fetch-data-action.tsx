"use server";

import { ChannelsQueryDocument } from "@/graphql/queries/generated";
import { resolveDashboardTenant } from "@/lib/saleor/config/context";
import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { maskString } from "@/lib/security";
import { getConfigProvider } from "@/providers/config";
import { getSaleorClient } from "@/providers/saleor";

import { type Schema } from "../schema";

export const fetchDataAction = async ({
  accessToken,
  saleorApiUrl,
}: {
  accessToken: string;
  saleorApiUrl: string;
}) => {
  const { saleorDomain } = await resolveDashboardTenant({
    accessToken,
    saleorApiUrl,
  });
  const configProvider = getConfigProvider();

  const data = await getSaleorClient({
    saleorDomain,
    authToken: accessToken,
  }).execute(ChannelsQueryDocument);
  const config = await configProvider.getBySaleorDomain({
    saleorDomain,
  });

  return data.channels?.reduce<Schema>((acc, { currencyCode, name, slug }) => {
    const paymentGatewayConfig = (config?.paymentGatewayConfig?.[slug] ??
      {}) as PaymentGatewayConfig[string];

    acc[slug] = {
      currency: currencyCode,
      name: name,
      webhookId: paymentGatewayConfig.webhookId,
      webhookSecretKey: paymentGatewayConfig.webhookSecretKey
        ? maskString({
            visibleChars: 10,
            str: paymentGatewayConfig.webhookSecretKey,
          })
        : undefined,
      publicKey: paymentGatewayConfig.publicKey,
      secretKey: paymentGatewayConfig.secretKey,
    };

    return acc;
  }, {});
};
