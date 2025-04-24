import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { handleMutationErrors } from "#root/public/saleor/error";

import { PasswordChangeMutationDocument } from "../graphql/mutations/generated";
import type { PasswordChangeInfra, SaleorUserServiceConfig } from "../types";

export const saleorPasswordChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): PasswordChangeInfra =>
  async ({ accessToken, oldPassword, newPassword }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      PasswordChangeMutationDocument,
      {
        operationName: "PasswordChangeMutation",
        variables: { ...(oldPassword && { oldPassword }), newPassword },
      },
    );

    if (!result.ok) {
      logger.error("Error while changing password", { error: result.errors });

      return result;
    }

    if (result.data.passwordChange?.errors.length) {
      logger.error("Password change failed", {
        error: result.data.passwordChange.errors,
      });

      return err(handleMutationErrors(result.data.passwordChange.errors));
    }

    return ok(true);
  };
