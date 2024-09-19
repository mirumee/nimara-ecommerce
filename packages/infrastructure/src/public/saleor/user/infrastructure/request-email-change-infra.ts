import { graphqlClient } from "#root/graphql/client";

import { RequestEmailChangeMutationDocument } from "../graphql/mutations/generated";
import type {
  RequestEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorRequestEmailChangeInfra =
  ({ apiURL }: SaleorUserServiceConfig): RequestEmailChangeInfra =>
  async ({ accessToken, channel, newEmail, password, redirectUrl }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      RequestEmailChangeMutationDocument,
      {
        variables: { channel, newEmail, password, redirectUrl },
      },
    );

    return {
      errors: data?.requestEmailChange?.errors ?? [],
    };
  };
