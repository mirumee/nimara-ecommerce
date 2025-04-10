import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { RequestEmailChangeMutationDocument } from "../graphql/mutations/generated";
import type {
  RequestEmailChangeInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorRequestEmailChangeInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): RequestEmailChangeInfra =>
  async ({ accessToken, channel, newEmail, password, redirectUrl }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
      RequestEmailChangeMutationDocument,
      {
        variables: { channel, newEmail, password, redirectUrl },
        operationName: "RequestEmailChangeMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while requesting email change", {
        error: result.error,
      });

      return result;
    }

    if (result.data.requestEmailChange?.errors.length) {
      logger.error("Error while requesting email change", {
        error: result.data.requestEmailChange.errors,
      });

      return err({
        code: "EMAIL_CHANGE_REQUEST_ERROR",
      });
    }

    return ok({ success: true });
  };
