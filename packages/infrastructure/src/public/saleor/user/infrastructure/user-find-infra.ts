import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
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
    const { data, error } = await graphqlClient(apiURL, saleorAppToken).execute(
      UserFindQueryDocument,
      {
        variables: {
          email,
        },
      },
    );

    if (error) {
      logger.error(
        `Fetching user by email: ${email} failed`,
        error as BaseError,
      );
    }

    return data?.user ?? null;
  };
};
