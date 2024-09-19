import { graphqlClient } from "#root/graphql/client";

import { AccountRequestDeletionMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountRequestDeletionInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountRequestDeletionInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountRequestDeletionInfra =>
  async ({ accessToken, channel, redirectUrl }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountRequestDeletionMutationDocument,
      { variables: { channel, redirectUrl } },
    );

    return data?.accountRequestDeletion ?? null;
  };
