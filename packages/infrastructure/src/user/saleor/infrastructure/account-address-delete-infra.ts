import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountAddressDeleteInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { AccountAddressDeleteMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountAddressDeleteInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressDeleteInfra =>
  async ({ accessToken, id }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressDeleteMutationDocument,
      {
        variables: {
          id,
        },
        operationName: "AccountAddressDeleteMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while deleting an address", { result, id });

      return result;
    }

    if (result.data.accountAddressDelete?.errors.length) {
      logger.error("Error while deleting an address", {
        id,
        result,
      });

      return err([
        {
          code: "ADDRESS_DELETE_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
