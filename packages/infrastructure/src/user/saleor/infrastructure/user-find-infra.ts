import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { SaleorUserServiceConfig, UserFindInfra } from "../../types";
import { UserFindQueryDocument } from "../graphql/queries/generated";

export const saleorUserFindInfra = ({
  apiURL,
  logger,
}: SaleorUserServiceConfig): UserFindInfra => {
  return async ({ email, saleorAppToken }) => {
    const result = await graphqlClient(apiURL, saleorAppToken).execute(
      UserFindQueryDocument,
      {
        variables: {
          email,
        },
        operationName: "UserFindQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching user by email", {
        error: result.errors,
      });

      return result;
    }

    if (!result.data.user) {
      return ok({ user: null });
    }

    return ok({ user: result.data.user });
  };
};
