import { graphqlClient } from "#root/graphql/client";
import { serializeMetadata } from "#root/lib/serializers/metadata";

import { AccountUpdateMutationDocument } from "../graphql/mutations/generated";
import type { AccountUpdateInfra, SaleorUserServiceConfig } from "../types";

export const saleorAccountUpdateInfra =
  ({ apiURL }: SaleorUserServiceConfig): AccountUpdateInfra =>
  async ({ accountInput, accessToken }) => {
    const { data } = await graphqlClient(apiURL, accessToken).execute(
      AccountUpdateMutationDocument,
      { variables: { accountInput } },
    );

    const user = data?.accountUpdate?.user;

    if (user) {
      return {
        errors: [],
        user: {
          ...user,
          metadata: serializeMetadata(user.metadata),
          checkoutIds: user.checkoutIds ?? [],
        },
      };
    }

    return { errors: data?.accountUpdate?.errors ?? [], user: null };
  };
