import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { TokenRefreshMutationDocument } from "../graphql/mutations/generated";
import type { SaleorAuthServiceConfig, TokenRefreshInfra } from "../types";

export const saleorTokenRefreshInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): TokenRefreshInfra =>
  async ({ refreshToken }) => {
    const result = await graphqlClientV2(apiURL).execute(
      TokenRefreshMutationDocument,
      {
        variables: { refreshToken },
        options: { headers: { Cookie: `refreshToken=${refreshToken}` } },
        operationName: "TokenRefreshMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to refresh the token.", { error: result.error });

      return result;
    }

    if (result.data.tokenRefresh?.errors.length) {
      logger.error("Token refresh mutation returned errors.", {
        error: result.data.tokenRefresh.errors,
      });

      return err({
        code: "TOKEN_REFRESH_ERROR",
      });
    }

    if (!result.data.tokenRefresh?.token) {
      logger.debug("Token refresh mutation returned no token.");

      return ok({ refreshToken: null });
    }

    return ok({ refreshToken: result.data.tokenRefresh.token });
  };
