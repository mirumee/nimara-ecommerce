import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { RequestPasswordResetMutationDocument } from "../graphql/mutations/generated";
import type {
  RequestPasswordResetInfra,
  SaleorAuthServiceConfig,
} from "../types";

export const saleorRequestPasswordResetInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): RequestPasswordResetInfra =>
  async ({ channel, email, redirectUrl }) => {
    const result = await graphqlClientV2(apiURL).execute(
      RequestPasswordResetMutationDocument,
      {
        variables: { channel, email, redirectUrl },
        operationName: "RequestPasswordResetMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to request password reset.", {
        error: result.error,
      });

      return result;
    }

    if (result.data.requestPasswordReset?.errors.length) {
      logger.error("Request password reset mutation returned errors.", {
        error: result.data.requestPasswordReset.errors,
      });

      return err({
        code: "PASSWORD_CHANGE_REQUEST_ERROR",
      });
    }

    return ok({ success: true });
  };
