import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountSetDefaultAddressInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { AccountSetDefaultAddressMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountSetDefaultAddressInfra =
  ({
    apiURL,
    logger,
  }: SaleorUserServiceConfig): AccountSetDefaultAddressInfra =>
  async ({ accessToken, id, type }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountSetDefaultAddressMutationDocument,
      {
        variables: {
          id,
          type,
        },
        operationName: "AccountSetDefaultAddressMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while setting default address", {
        error: result.errors,
      });

      return result;
    }

    if (result.data.accountSetDefaultAddress?.errors.length) {
      logger.error("Error while setting default address", {
        error: result.data.accountSetDefaultAddress.errors,
      });

      return err([
        {
          code: "ADDRESS_SET_DEFAULT_ERROR",
        },
      ]);
    }

    return ok({ success: true });
  };
