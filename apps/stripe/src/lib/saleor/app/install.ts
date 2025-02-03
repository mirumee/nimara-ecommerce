import { type JWSProvider } from "@/lib/jwks/types";

import { type SaleorAppConfigProvider } from "../config/types";
import { SaleorAppInstallationError } from "../error";
import { type SaleorClient } from "../graphql/types";

export const installApp = async ({
  configProvider,
  saleorClient,
  saleorAuthToken,
  saleorUrl,
  saleorDomain,
  jwksProvider,
}: {
  configProvider: SaleorAppConfigProvider;
  jwksProvider: JWSProvider;
  saleorAuthToken: string;
  saleorClient: SaleorClient;
  saleorDomain: string;
  saleorUrl: string;
}) => {
  const saleorAppId = await saleorClient.getAppId();

  if (!saleorAppId) {
    throw new SaleorAppInstallationError();
  }

  await configProvider.createOrUpdate({
    saleorDomain,
    authToken: saleorAuthToken,
    saleorAppId,
    paymentGatewayConfig: {},
  });

  await jwksProvider.get({
    issuer: saleorUrl,
    forceRefresh: true,
  });
};
