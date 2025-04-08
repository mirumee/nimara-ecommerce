import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { PasswordChangeMutationDocument } from "../graphql/mutations/generated";
import type { PasswordChangeInfra, SaleorUserServiceConfig } from "../types";

export const saleorPasswordChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): PasswordChangeInfra =>
  async ({ accessToken, oldPassword, newPassword }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
      PasswordChangeMutationDocument,
      {
        operationName: "PasswordChangeMutation",
        variables: { ...(oldPassword && { oldPassword }), newPassword },
      },
    );

    if (!result.ok) {
      logger.error("Error while changing password", { result });

      return result;
    }

    if (!!result.data.passwordChange?.errors.length) {
      logger.error("Password change failed", {
        error: result.data.passwordChange.errors,
      });

      return err({
        code: "PASSWORD_CHANGE_FAILED",
      });
    }

    return ok(true);
  };
