import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { PasswordSetInfra, SaleorAuthServiceConfig } from "../../types";
import { PasswordSetMutationDocument } from "../graphql/mutations/generated";

export const saleorPasswordSetInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): PasswordSetInfra =>
  async ({ password, email, token }) => {
    const result = await graphqlClient(apiURL).execute(
      PasswordSetMutationDocument,
      {
        variables: { password, email, token },
        operationName: "PasswordSetMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to set password.", { errors: result.errors });

      return result;
    }

    if (result.data.setPassword?.errors.length) {
      logger.error("Set password mutation returned errors.", {
        error: result.data.setPassword.errors,
      });

      return err([
        {
          code: "PASSWORD_SET_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
