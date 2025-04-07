import { graphqlClient } from "#root/graphql/client";

import { AccountAddressDeleteMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressDeleteInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressDeleteInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressDeleteInfra =>
  async ({ accessToken, id }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressDeleteMutationDocument,
      {
        variables: {
          id,
        },
      },
    );

    if (error) {
      logger.error("Error while deleting an address", { error });

      return null;
    }

    if (data?.accountAddressDelete?.errors.length) {
      logger.error("Error while deleting an address", {
        error: data.accountAddressDelete.errors,
      });

      return null;
    }

    return data?.accountAddressDelete ?? null;
  };
