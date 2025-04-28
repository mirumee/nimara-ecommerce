import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { serializeMetadata } from "#root/lib/serializers/metadata";

import type { AccountUpdateInfra, SaleorUserServiceConfig } from "../../types";
import { AccountUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountUpdateInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountUpdateInfra =>
  async ({ accountInput, accessToken }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountUpdateMutationDocument,
      { variables: { accountInput }, operationName: "AccountUpdateMutation" },
    );

    if (!result.ok) {
      return result;
    }

    if (result.data.accountUpdate?.errors.length) {
      logger.error("Error while updating account", {
        error: result.data.accountUpdate.errors,
      });

      return err([
        {
          code: "ACCOUNT_UPDATE_ERROR",
        },
      ]);
    }

    if (!result.data.accountUpdate?.user) {
      logger.error("Error while updating account. No user found.", {
        error: "User not found",
      });

      return err([
        {
          code: "ACCOUNT_UPDATE_ERROR",
        },
      ]);
    }

    const user = result.data.accountUpdate.user;

    return ok({
      ...user,
      metadata: serializeMetadata(user.metadata),
      checkoutIds: user.checkoutIds ?? [],
    });
  };
