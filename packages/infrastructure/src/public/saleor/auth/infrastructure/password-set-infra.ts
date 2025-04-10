import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { PasswordSetMutationDocument } from "../graphql/mutations/generated";
import type { PasswordSetInfra, SaleorAuthServiceConfig } from "../types";

export const saleorPasswordSetInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): PasswordSetInfra =>
  async ({ password, email, token }) => {
    const result = await graphqlClientV2(apiURL).execute(
      PasswordSetMutationDocument,
      {
        variables: { password, email, token },
        operationName: "PasswordSetMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to set password.", { error: result.error });

      return result;
    }

    if (result.data.setPassword?.errors.length) {
      logger.error("Set password mutation returned errors.", {
        error: result.data.setPassword.errors,
      });

      return err({
        code: "PASSWORD_SET_ERROR",
      });
    }

    return ok({ success: true });
  };
