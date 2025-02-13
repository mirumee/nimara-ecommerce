"use server";

import { ChannelsQueryDocument } from "@/graphql/queries/generated";
import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { maskString } from "@/lib/security";
import { getConfigProvider } from "@/providers/config";
import { getSaleorClient } from "@/providers/saleor";

import { type Schema } from "../schema";

export const fetchDataAction = async ({
  accessToken,
  domain,
}: {
  accessToken: string;
  domain: string;
}) => {
  const configProvider = getConfigProvider({ saleorDomain: domain });

  const data = await getSaleorClient({
    saleorDomain: domain,
    authToken: accessToken,
  }).execute(ChannelsQueryDocument);
  const config = await configProvider.getBySaleorDomain({
    saleorDomain: domain,
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
