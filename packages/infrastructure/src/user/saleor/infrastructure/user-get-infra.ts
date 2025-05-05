import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { serializeMetadata } from "#root/lib/serializers/metadata";

import type { SaleorUserServiceConfig, UserGetInfra } from "../../types";
import { CurrentUserDocument } from "../graphql/queries/generated";

export const saleorUserGetInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): UserGetInfra =>
  async (accessToken) => {
    if (!accessToken) {
      return ok(null);
    }

    const result = await graphqlClient(apiURL, accessToken).execute(
      CurrentUserDocument,
      {
        operationName: "MeQuery",
      },
    );

    if (!result.ok) {
      logger.error(`Error fetching user data`, {
        errors: result.errors,
        apiURL,
      });

      return result;
    }

    if (!result.data?.me) {
      logger.error(`User not found`, {
        errors: result.errors,
        apiURL,
        accessToken,
      });

      return ok(null);
    }

    const user = result.data.me;

    return ok({
      ...user,
      metadata: serializeMetadata(user.metadata),
      checkoutIds: user.checkoutIds ?? [],
    });
  };
