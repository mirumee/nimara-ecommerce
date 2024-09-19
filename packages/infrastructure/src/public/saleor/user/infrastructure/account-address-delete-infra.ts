import { graphqlClient } from "#root/graphql/client";

import { AccountAddressDeleteMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressDeleteInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressDeleteInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountAddressDeleteInfra =>
  async ({ accessToken, id }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressDeleteMutationDocument,
      {
        variables: {
          id,
        },
      },
    );

    return data?.accountAddressDelete ?? null;
  };
