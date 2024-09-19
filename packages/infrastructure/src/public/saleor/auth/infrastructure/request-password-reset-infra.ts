import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { RequestPasswordResetMutationDocument } from "../graphql/mutations/generated";
import type {
  RequestPasswordResetInfra,
  SaleorAuthServiceConfig,
} from "../types";

export const saleorRequestPasswordResetInfra =
  ({ apiURL }: SaleorAuthServiceConfig): RequestPasswordResetInfra =>
  async ({ channel, email, redirectUrl }) => {
    const { data } = await graphqlClient(apiURL).execute(
      RequestPasswordResetMutationDocument,
      {
        variables: { channel, email, redirectUrl },
      },
    );

    if (data?.requestPasswordReset?.errors.length) {
      loggingService.error("Request password error", {
        email,
        redirectUrl,
        error: data.requestPasswordReset.errors,
      });

      return { errors: data.requestPasswordReset.errors };
    }

    return {
      errors: data?.requestPasswordReset?.errors ?? [],
    };
  };
