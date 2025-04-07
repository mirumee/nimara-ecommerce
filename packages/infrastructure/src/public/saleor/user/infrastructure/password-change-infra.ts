import { graphqlClientV2 } from "#root/graphql/client";

import { PasswordChangeMutationDocument } from "../graphql/mutations/generated";
import type { PasswordChangeInfra, SaleorUserServiceConfig } from "../types";

export const saleorPasswordChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): PasswordChangeInfra =>
  async ({ accessToken, oldPassword, newPassword }) => {
    const { data, error } = await graphqlClientV2(apiURL, accessToken).execute(
      PasswordChangeMutationDocument,
      {
        operationName: "PasswordChangeMutation",
        variables: { ...(oldPassword && { oldPassword }), newPassword },
      },
    );

    if (error) {
      logger.error("Error while changing password", { error });

      return { success: false, serverError: error };
    }

    if (data.passwordChange?.errors.length) {
      logger.error("Password change failed", data.passwordChange.errors);

      return {
        success: false,
        errors: data.passwordChange.errors,
      };
    }

    return { success: true };
  };
