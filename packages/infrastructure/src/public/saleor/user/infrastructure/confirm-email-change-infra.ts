import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { ConfirmEmailChangeMutationDocument } from "../graphql/mutations/generated";
import type {
  ConfirmEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorConfirmEmailChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): ConfirmEmailChangeInfra =>
  async ({ accessToken, channel, token }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
      ConfirmEmailChangeMutationDocument,
      {
        variables: { channel, token },
        operationName: "ConfirmEmailChangeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while confirming email change", {
        error: result.errors,
      });

      return result;
    }

    if (result.data.confirmEmailChange?.errors.length) {
      logger.error("Error while confirming email change", {
        error: result.data.confirmEmailChange.errors,
      });

      return err([
        {
          code: "EMAIL_CHANGE_CONFIRMATION_ERROR",
        },
      ]);
    }

    if (!result.data.confirmEmailChange?.user) {
      logger.error("Error while confirming email change", {
        error: "No user returned",
      });

      return err([{ code: "EMAIL_CHANGE_CONFIRMATION_ERROR" }]);
    }

    return ok(result.data.confirmEmailChange);
  };
