import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { getNextServerCookiesStorageAsync } from "@saleor/auth-sdk/next/server";
import { invariant } from "graphql/jsutils/invariant";

export type SaleorAuthClientConfig = {
  saleorApiUrl: string;
};

export const createSaleorAuthClientFromConfig = async (
  config: SaleorAuthClientConfig,
) => {
  invariant(
    config.saleorApiUrl,
    "Saleor getServerAuthClient: saleorApiUrl is missing.",
  );

  const nextServerCookiesStorage = await getNextServerCookiesStorageAsync();

  return createSaleorAuthClient({
    saleorApiUrl: config.saleorApiUrl,
    refreshTokenStorage: nextServerCookiesStorage,
    accessTokenStorage: nextServerCookiesStorage,
  });
};
