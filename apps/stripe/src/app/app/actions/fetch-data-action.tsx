"use server";

import { ChannelsQueryDocument } from "@/graphql/queries/generated";
import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { getConfigProvider } from "@/providers/config";
import { getSaleorClient } from "@/providers/saleor";

export const fetchDataAction = async ({
  accessToken,
  domain,
}: {
  accessToken: string;
  domain: string;
}) => {
  const configProvider = getConfigProvider({ saleorDomain: domain });

  const data = await getSaleorClient({ authToken: accessToken }).execute(
    ChannelsQueryDocument,
  );

  const config = await configProvider.getBySaleorDomain({
    saleorDomain: domain,
  });

  return (
    data.channels?.map((channel) => {
      const paymentGatewayConfig = (config?.paymentGatewayConfig?.[
        channel.slug
      ] ?? {}) as PaymentGatewayConfig[string];

      return {
        channel,
        paymentGatewayConfig,
      };
    }) ?? []
  );
};
