import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountRequestDeletionInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { AccountRequestDeletionMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountRequestDeletionInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountRequestDeletionInfra =>
  async ({ accessToken, channel, redirectUrl }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountRequestDeletionMutationDocument,
      {
        variables: { channel, redirectUrl },
        operationName: "AccountRequestDeletionMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while requesting account deletion", {
        error: result.errors,
      });

      return result;
    }

    if (result.data.accountRequestDeletion?.errors.length) {
      logger.error("Error while requesting account deletion", {
        error: result.data.accountRequestDeletion.errors,
      });

      return err([
        {
          code: "ACCOUNT_REQUEST_DELETION_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
