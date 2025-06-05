import { ok } from "@nimara/domain/objects/Result";

import { serializeAddress } from "#root/address/saleor/serializers";
import { graphqlClient } from "#root/graphql/client";

import {
  type AddressesGetInfra,
  type SaleorUserServiceConfig,
} from "../../types";
import { UserAddressesQueryDocument } from "../graphql/queries/generated";

export const saleorAddressesGetInfra =
  ({ apiURL, logger }: SaleorUserServiceConfig): AddressesGetInfra =>
  async ({ variables: { accessToken }, skip = false }) => {
    if (!accessToken) {
      logger.debug("Guest user. Skipping user addresses fetch.");

      return ok([]);
    }

    if (skip) {
      logger.debug("Manual skip. Skipping user addresses fetch.");

      return ok([]);
    }

    const result = await graphqlClient(apiURL, accessToken).execute(
      UserAddressesQueryDocument,
      {
        operationName: "UserAddressesQuery",
      },
    );

    if (!result.ok) {
      logger.error("Failed to fetch user addresses", { error: result.errors });

      return result;
    }

    const serializedAddresses = result.data.me?.addresses
      ? result.data.me.addresses.map(serializeAddress)
      : [];

    return ok(serializedAddresses);
  };
