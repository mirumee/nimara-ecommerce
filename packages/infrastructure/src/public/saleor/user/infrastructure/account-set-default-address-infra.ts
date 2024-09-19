import { graphqlClient } from "#root/graphql/client";

import { AccountSetDefaultAddressMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountSetDefaultAddressInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountSetDefaultAddressInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountSetDefaultAddressInfra =>
  async ({ accessToken, id, type }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountSetDefaultAddressMutationDocument,
      {
        variables: {
          id,
          type,
        },
      },
    );

    return data?.accountSetDefaultAddress ?? null;
  };
