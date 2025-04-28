import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  RequestEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { RequestEmailChangeMutationDocument } from "../graphql/mutations/generated";

export const saleorRequestEmailChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): RequestEmailChangeInfra =>
  async ({ accessToken, channel, newEmail, password, redirectUrl }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      RequestEmailChangeMutationDocument,
      {
        variables: { channel, newEmail, password, redirectUrl },
        operationName: "RequestEmailChangeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while requesting email change", {
        error: result.errors,
      });

      return result;
    }

    if (result.data.requestEmailChange?.errors.length) {
      logger.error("Error while requesting email change", {
        error: result.data.requestEmailChange.errors,
      });

      return err([
        {
          code: "EMAIL_CHANGE_REQUEST_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
