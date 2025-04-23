import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClientV2 } from "#root/graphql/client";

import { AccountSetDefaultAddressMutationDocument } from "../graphql/mutations/generated";
import type {
  AccountSetDefaultAddressInfra,
  SaleorUserServiceConfig,
} from "../types";

export const saleorAccountSetDefaultAddressInfra =
  ({
    apiURL,
    logger,
  }: SaleorUserServiceConfig): AccountSetDefaultAddressInfra =>
  async ({ accessToken, id, type }) => {
    const result = await graphqlClientV2(apiURL, accessToken).execute(
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
