import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { ConfirmAccountMutationDocument } from "../graphql/mutations/generated";
import type { ConfirmAccountInfra, SaleorAuthServiceConfig } from "../types";

export const saleorConfirmAccountInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): ConfirmAccountInfra =>
  async ({ email, token }) => {
    const result = await graphqlClientV2(apiURL).execute(
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
