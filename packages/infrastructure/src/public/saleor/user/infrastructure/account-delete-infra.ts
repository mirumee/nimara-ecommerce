import { graphqlClient } from "#root/graphql/client";

import { AccountDeleteMutationDocument } from "../graphql/mutations/generated";
import type { AccountDeleteInfra, SaleorUserServiceConfig } from "../types";

export const saleorAccountDeleteInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountDeleteInfra =>
  async ({ accessToken, token }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountDeleteMutationDocument,
      { variables: { token } },
    );

    if (error) {
      logger.error("Error while deleting an account", { error });

      return null;
    }

    if (data?.accountDelete?.errors.length) {
      logger.error("Error while deleting an account", {
        error: data.accountDelete.errors,
      });

      return null;
    }

    return data?.accountDelete ?? null;
  };
