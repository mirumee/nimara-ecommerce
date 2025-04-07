import { graphqlClient } from "#root/graphql/client";

import { ConfirmEmailChangeMutationDocument } from "../graphql/mutations/generated";
import type {
  ConfirmEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorConfirmEmailChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): ConfirmEmailChangeInfra =>
  async ({ accessToken, channel, token }) => {
    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      ConfirmEmailChangeMutationDocument,
      {
        variables: { channel, token },
      },
    );

    if (error) {
      logger.error("Error while confirming email change", { error });

      return {
        user: null,
        errors: [],
      };
    }

    if (data?.confirmEmailChange?.errors.length) {
      logger.error("Error while confirming email change", {
        error: data.confirmEmailChange.errors,
      });

      return {
        user: null,
        errors: data.confirmEmailChange.errors,
      };
    }

    return {
      user: data?.confirmEmailChange?.user ?? null,
      errors: data?.confirmEmailChange?.errors ?? [],
    };
  };
