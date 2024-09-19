import { graphqlClient } from "#root/graphql/client";

import { AccountAddressUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressUpdateInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressUpdateInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountAddressUpdateInfra =>
  async ({ accessToken, input, id }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressUpdateMutationDocument,
      {
        variables: {
          input,
          id,
        },
      },
    );

    return data?.accountAddressUpdate ?? null;
  };
