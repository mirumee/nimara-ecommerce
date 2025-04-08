import { ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";
import type {
  SaleorUserServiceConfig,
  UserFindInfra,
} from "#root/public/saleor/user/types";

import { UserFindQueryDocument } from "../graphql/queries/generated";

export const saleorUserFindInfra = ({
  apiURL,
  logger,
}: SaleorUserServiceConfig): UserFindInfra => {
  return async ({ email, saleorAppToken }) => {
    const result = await graphqlClientV2(apiURL, saleorAppToken).execute(
      UserFindQueryDocument,
      {
        variables: {
          email,
        },
        operationName: "UserFindQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching user by email", { result });

      return result;
    }

    if (!result.data.user) {
      return ok({ user: null });
    }

    return ok({ user: result.data.user });
  };
};
