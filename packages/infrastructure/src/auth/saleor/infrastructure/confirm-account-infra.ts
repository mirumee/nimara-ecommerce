import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { ConfirmAccountInfra, SaleorAuthServiceConfig } from "../../types";
import { ConfirmAccountMutationDocument } from "../graphql/mutations/generated";

export const saleorConfirmAccountInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): ConfirmAccountInfra =>
  async ({ email, token }) => {
    const result = await graphqlClient(apiURL).execute(
      ConfirmAccountMutationDocument,
      { variables: { email, token }, operationName: "ConfirmAccountMutation" },
    );

    if (!result.ok) {
      logger.error("Failed to confirm account.", { errors: result.errors });

      return result;
    }

    if (result.data.confirmAccount?.errors.length) {
      logger.error("Confirm account mutation returned errors.", {
        error: result.data.confirmAccount.errors,
      });

      return err([
        {
          code: "ACCOUNT_CONFIRM_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
