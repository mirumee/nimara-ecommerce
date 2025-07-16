import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { AccountDeleteInfra, UserServiceConfig } from "../../types";
import { AccountDeleteMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountDeleteInfra =
  ({ apiURL, logger }: UserServiceConfig): AccountDeleteInfra =>
  async ({ accessToken, token }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountDeleteMutationDocument,
      { variables: { token }, operationName: "AccountDeleteMutation" },
    );

    if (!result.ok) {
      logger.error("Error while deleting an account", { error: result.errors });

      return result;
    }

    if (result.data.accountDelete?.errors.length) {
      logger.error("Error while deleting an account", {
        error: result.data.accountDelete.errors,
      });

      return err([
        {
          code: "ACCOUNT_DELETE_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
