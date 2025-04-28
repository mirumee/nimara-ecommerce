import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountAddressCreateInfra,
  SaleorUserServiceConfig,
} from "../../types";
import { AccountAddressCreateMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountAddressCreateInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AccountAddressCreateInfra =>
  async ({ accessToken, input, type }) => {
    const result = await graphqlClient(apiURL, accessToken).execute(
      AccountAddressCreateMutationDocument,
      {
        variables: {
          input,
          type,
        },
        operationName: "AccountAddressCreateMutation",
      },
    );

    if (!result.ok) {
      logger.error("Error while creating a new address", {
        error: result.errors,
      });

      return result;
    }

    if (result.data.accountAddressCreate?.errors.length) {
      logger.error("Error while creating a new address", {
        error: result.data,
      });

      return err([{ code: "ADDRESS_CREATE_ERROR" }]);
    }

    if (!result.data.accountAddressCreate?.address) {
      logger.error("Error while creating a new address", {
        error: "No address returned",
      });

      return err([{ code: "ADDRESS_CREATE_ERROR" }]);
    }

    return ok({ id: result.data.accountAddressCreate.address.id });
  };
