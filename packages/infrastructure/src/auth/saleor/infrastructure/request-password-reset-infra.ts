import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  RequestPasswordResetInfra,
  SaleorAuthServiceConfig,
} from "../../types";
import { RequestPasswordResetMutationDocument } from "../graphql/mutations/generated";

export const saleorRequestPasswordResetInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): RequestPasswordResetInfra =>
  async ({ channel, email, redirectUrl }) => {
    const result = await graphqlClient(apiURL).execute(
      RequestPasswordResetMutationDocument,
      {
        variables: { channel, email, redirectUrl },
        operationName: "RequestPasswordResetMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to request password reset.", {
        errors: result.errors,
      });

      return result;
    }

    if (result.data.requestPasswordReset?.errors.length) {
      logger.error("Request password reset mutation returned errors.", {
        error: result.data.requestPasswordReset.errors,
      });

      return err([
        {
          code: "PASSWORD_CHANGE_REQUEST_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
