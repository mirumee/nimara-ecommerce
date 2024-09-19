import { graphqlClientV2 } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { PasswordChangeMutationDocument } from "../graphql/mutations/generated";
import type { PasswordChangeInfra, SaleorUserServiceConfig } from "../types";

export const saleorPasswordChangeInfra =
  ({ apiURL }: SaleorUserServiceConfig): PasswordChangeInfra =>
  async ({ accessToken, oldPassword, newPassword }) => {
    const { data, error } = await graphqlClientV2(apiURL, accessToken).execute(
      PasswordChangeMutationDocument,
      {
        operationName: "PasswordChangeMutation",
        variables: { ...(oldPassword && { oldPassword }), newPassword },
      },
    );

    if (error) {
      return { success: false, serverError: error };
    }

    if (data.passwordChange?.errors.length) {
      loggingService.error(
        "Password change failed",
        data.passwordChange.errors,
      );

      return {
        success: false,
        errors: data.passwordChange.errors,
      };
    }

    return { success: true };
  };
