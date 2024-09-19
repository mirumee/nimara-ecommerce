import { graphqlClient } from "#root/graphql/client";

import { AccountDeleteMutationDocument } from "../graphql/mutations/generated";
import type { AccountDeleteInfra, SaleorUserServiceConfig } from "../types";

export const saleorAccountDeleteInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountDeleteInfra =>
  async ({ accessToken, token }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountDeleteMutationDocument,
      { variables: { token } },
    );

    return data?.accountDelete ?? null;
  };
