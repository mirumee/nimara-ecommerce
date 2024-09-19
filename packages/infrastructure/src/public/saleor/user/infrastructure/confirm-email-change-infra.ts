import { graphqlClient } from "#root/graphql/client";

import { ConfirmEmailChangeMutationDocument } from "../graphql/mutations/generated";
import type {
  ConfirmEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorConfirmEmailChangeInfra =
  ({ apiURL }: SaleorUserServiceConfig): ConfirmEmailChangeInfra =>
  async ({ accessToken, channel, token }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      ConfirmEmailChangeMutationDocument,
      {
        variables: { channel, token },
      },
    );

    return {
      user: data?.confirmEmailChange?.user ?? null,
      errors: data?.confirmEmailChange?.errors ?? [],
    };
  };
