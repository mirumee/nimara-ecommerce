import { graphqlClient } from "#root/graphql/client";

import { TokenRefreshMutationDocument } from "../graphql/mutations/generated";
import type { SaleorAuthServiceConfig, TokenRefreshInfra } from "../types";

export const saleorTokenRefreshInfra =
  ({ apiURL }: SaleorAuthServiceConfig): TokenRefreshInfra =>
  async ({ refreshToken }) => {
    const { data } = await graphqlClient(apiURL).execute(
      TokenRefreshMutationDocument,
      {
        variables: { refreshToken },
        options: { headers: { Cookie: `refreshToken=${refreshToken}` } },
      },
    );

    return {
      errors: data?.tokenRefresh?.errors ?? [],
      token: data?.tokenRefresh?.token ?? null,
    };
  };
