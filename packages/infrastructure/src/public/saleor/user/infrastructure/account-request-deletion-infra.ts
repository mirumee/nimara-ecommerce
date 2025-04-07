import { graphqlClient } from "#root/graphql/client";

import { AccountRequestDeletionMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountRequestDeletionInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountRequestDeletionInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountRequestDeletionInfra =>
  async ({ accessToken, channel, redirectUrl }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      AccountRequestDeletionMutationDocument,
      { variables: { channel, redirectUrl } },
    );

    if (error) {
      logger.error("Error while requesting account deletion", { error });

      return null;
    }

    if (data?.accountRequestDeletion?.errors.length) {
      logger.error("Error while requesting account deletion", {
        error: data.accountRequestDeletion.errors,
      });

      return null;
    }

    return data?.accountRequestDeletion ?? null;
  };
