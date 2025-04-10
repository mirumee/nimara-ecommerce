import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { AccountDeleteMutationDocument } from "../graphql/mutations/generated";
import type { AccountDeleteInfra, SaleorUserServiceConfig } from "../types";

export const saleorAccountDeleteInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountDeleteInfra =>
  async ({ accessToken, token }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
      AccountDeleteMutationDocument,
      { variables: { token }, operationName: "AccountDeleteMutation" },
    );

    if (!result.ok) {
      logger.error("Error while deleting an account", { error: result.error });

      return result;
    }

    if (result.data.accountDelete?.errors.length) {
      logger.error("Error while deleting an account", {
        error: result.data.accountDelete.errors,
      });

      return err({
        code: "ACCOUNT_DELETE_ERROR",
      });
    }

    return ok({ success: true });
  };
