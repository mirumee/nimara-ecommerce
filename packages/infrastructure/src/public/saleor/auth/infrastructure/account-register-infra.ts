import { graphqlClient } from "#root/graphql/client";

import { AccountRegisterMutationDocument } from "../graphql/mutations/generated";
import type { AccountRegisterInfra, SaleorAuthServiceConfig } from "../types";

export const saleorAccountRegisterInfra =
  ({ apiURL }: SaleorAuthServiceConfig): AccountRegisterInfra =>
  async (accountRegisterInput) => {
    const { data } = await graphqlClient(apiURL).execute(
      AccountRegisterMutationDocument,
      { variables: { accountRegisterInput } },
    );

    return data?.accountRegister ?? null;
  };
