import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { AccountAddressCreateMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountAddressCreateInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountAddressCreateInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountAddressCreateInfra =>
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
      loggingService.error("Error while creating a new address", { error });

      return null;
    }

    if (data?.accountAddressCreate?.errors.length) {
      loggingService.error("Error while creating a new address", {
        error: data.accountAddressCreate.errors,
      });

      return null;
    }

    return data?.accountAddressCreate ?? null;
  };
