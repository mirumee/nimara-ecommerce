import { graphqlClient } from "#root/graphql/client";

import { AccountAddressUpdateMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressUpdateInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressUpdateInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressUpdateInfra =>
  async ({ accessToken, input, id }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressUpdateMutationDocument,
      {
        variables: {
          input,
          id,
        },
      },
    );

    if (error) {
      logger.error("Error while updating an address", { error });

      return null;
    }

    if (data?.accountAddressUpdate?.errors.length) {
      logger.error("Error while updating an address", {
        error: data.accountAddressUpdate.errors,
      });

      return null;
    }

    return data?.accountAddressUpdate ?? null;
  };
