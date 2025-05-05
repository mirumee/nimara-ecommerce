import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountRegisterInfra,
  SaleorAuthServiceConfig,
} from "../../types";
import { AccountRegisterMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountRegisterInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): AccountRegisterInfra =>
  async (accountRegisterInput) => {
    const result = await graphqlClient(apiURL).execute(
      AccountRegisterMutationDocument,
      {
        variables: { accountRegisterInput },
        operationName: "AccountRegisterMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to register account.", { errors: result.errors });

      return result;
    }

    if (result.data.accountRegister?.errors.length) {
      logger.error("Account register mutation returned errors.", {
        error: result.data.accountRegister.errors,
      });

      return err([
        {
          code: "ACCOUNT_REGISTER_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
