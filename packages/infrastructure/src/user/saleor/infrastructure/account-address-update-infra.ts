import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountAddressUpdateInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { AccountAddressUpdateMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountAddressUpdateInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressUpdateInfra =>
  async ({ accessToken, input, id }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressUpdateMutationDocument,
      {
        variables: {
          input,
          id,
        },
        operationName: "AccountAddressUpdateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while updating an address", { result, id });

      return result;
    }

    if (result.data.accountAddressUpdate?.errors.length) {
      logger.error("Error while updating an address", {
        id,
        result,
      });

      return err([
        {
          code: "ADDRESS_UPDATE_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
