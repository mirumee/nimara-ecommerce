import { graphqlClient } from "#root/graphql/client";

import { AccountSetDefaultAddressMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountSetDefaultAddressInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountSetDefaultAddressInfra =
  ({
    apiURL,
    logger,
  }: SaleorUserServiceConfig): AccountSetDefaultAddressInfra =>
  async ({ accessToken, id, type }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountSetDefaultAddressMutationDocument,
      {
        variables: {
          id,
          type,
        },
      },
    );

    if (error) {
      logger.error("Error while setting default address", { error });

      return null;
    }

    if (data?.accountSetDefaultAddress?.errors.length) {
      logger.error("Error while setting default address", {
        error: data.accountSetDefaultAddress.errors,
      });

      return null;
    }

    return data?.accountSetDefaultAddress ?? null;
  };
