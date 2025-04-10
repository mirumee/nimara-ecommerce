import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { AccountRequestDeletionMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountRequestDeletionInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountRequestDeletionInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountRequestDeletionInfra =>
  async ({ accessToken, channel, redirectUrl }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
      AccountRequestDeletionMutationDocument,
      {
        variables: { channel, redirectUrl },
        operationName: "AccountRequestDeletionMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while requesting account deletion", { result });

      return result;
    }

    if (result.data.accountRequestDeletion?.errors.length) {
      logger.error("Error while requesting account deletion", { result });

      return err({
        code: "ACCOUNT_REQUEST_DELETION_ERROR",
      });
    }

    return ok({ success: true });
  };
