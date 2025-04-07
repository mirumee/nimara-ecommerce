import { graphqlClient } from "#root/graphql/client";

import { AccountAddressCreateMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressCreateInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressCreateInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressCreateInfra =>
  async ({ accessToken, input, type }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressCreateMutationDocument,
      {
        variables: {
          input,
          type,
        },
      },
    );

    if (error) {
      logger.error("Error while creating a new address", { error });

      return null;
    }

    if (data?.accountAddressCreate?.errors.length) {
      logger.error("Error while creating a new address", {
        error: data.accountAddressCreate.errors,
      });

      return null;
    }

    return data?.accountAddressCreate ?? null;
  };
