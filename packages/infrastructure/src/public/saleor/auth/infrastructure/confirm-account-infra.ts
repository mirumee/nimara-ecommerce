import { type BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { ConfirmAccountMutationDocument } from "../graphql/mutations/generated";
import type { ConfirmAccountInfra, SaleorAuthServiceConfig } from "../types";

export const saleorConfirmAccountInfra =
  ({ apiURL }: SaleorAuthServiceConfig): ConfirmAccountInfra =>
  async ({ email, token }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      ConfirmAccountMutationDocument,
      { variables: { email, token } },
    );

    if (error) {
      // TODO: Move the logging service from infra to use-case after refactor
      loggingService.error("Server error: failed to confirm the account", {
        email,
        error,
      });

      return {
        isSuccess: false,
        serverError: error as BaseError,
      };
    }

    if (data?.confirmAccount?.errors.length) {
      // TODO: Move the logging service from infra to use-case after refactor
      loggingService.error("Graphql error: failed to confirm the account", {
        email,
        errors: data.confirmAccount.errors,
      });

      return {
        isSuccess: false,
        errors: data.confirmAccount.errors,
      };
    }

    return {
      isSuccess: true,
    };
  };
