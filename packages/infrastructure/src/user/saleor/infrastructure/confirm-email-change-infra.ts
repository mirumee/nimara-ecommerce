import { err, ok } from "@nimara/domain/objects/Result";

import { handleMutationErrors } from "#root/error";
import { graphqlClient } from "#root/graphql/client";

import type {
  ConfirmEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { ConfirmEmailChangeMutationDocument } from "../graphql/mutations/generated";

export const saleorConfirmEmailChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): ConfirmEmailChangeInfra =>
  async ({ accessToken, channel, token }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
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

      return err(handleMutationErrors(result.data.confirmEmailChange.errors));
    }

    if (!result.data.confirmEmailChange?.user) {
      logger.error("Error while confirming email change", {
        error: "No user returned",
      });

      return err([{ code: "EMAIL_CHANGE_CONFIRMATION_ERROR" }]);
    }

    return ok(result.data.confirmEmailChange);
  };
