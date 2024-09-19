import { createSaleorAuthClient } from "@saleor/auth-sdk";
import { getNextServerCookiesStorage } from "@saleor/auth-sdk/next/server";
import { invariant } from "graphql/jsutils/invariant";

export const saleorAuthClient = () => {
  const nextServerCookiesStorage = getNextServerCookiesStorage();
  const saleorApiUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL || "";

  invariant(
    saleorApiUrl,
    "Saleor getServerAuthClient: NEXT_PUBLIC_SALEOR_API_URL is missing.",
  );

  return createSaleorAuthClient({
    saleorApiUrl,
    refreshTokenStorage: nextServerCookiesStorage,
    accessTokenStorage: nextServerCookiesStorage,
  });
};
