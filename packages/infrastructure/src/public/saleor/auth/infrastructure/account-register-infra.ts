import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { AccountRegisterMutationDocument } from "../graphql/mutations/generated";
import type { AccountRegisterInfra, SaleorAuthServiceConfig } from "../types";

export const saleorAccountRegisterInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): AccountRegisterInfra =>
  async (accountRegisterInput) => {
    const result = await graphqlClientV2(apiURL).execute(
      AccountRegisterMutationDocument,
      {
        variables: { accountRegisterInput },
        operationName: "AccountRegisterMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to register account.", { error: result.error });

      return result;
    }

    if (result.data.accountRegister?.errors.length) {
      logger.error("Account register mutation returned errors.", {
        error: result.data.accountRegister.errors,
      });

      return err({
        code: "ACCOUNT_REGISTER_ERROR",
      });
    }

    return ok({ success: true });
  };
