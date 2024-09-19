import { graphqlClient } from "#root/graphql/client";
import { serializeMetadata } from "#root/lib/serializers/metadata";

import { CurrentUserDocument } from "../graphql/queries/generated";
import type { SaleorUserServiceConfig, UserGetInfra } from "../types";

export const saleorUserGetInfra =
  ({ apiURL }: SaleorUserServiceConfig): UserGetInfra =>
  async (accessToken) => {
    if (!accessToken) {
      return null;
    }

    const { data } = await graphqlClient(apiURL, accessToken).execute(
      CurrentUserDocument,
    );

    const user = data?.me;

    if (user) {
      return {
        ...user,
        metadata: serializeMetadata(user.metadata),
        checkoutIds: user.checkoutIds ?? [],
      };
    }

    return null;
  };
