import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { AddressesGetInfra, SaleorUserServiceConfig } from "../../types";
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

    return ok(result.data.me?.addresses ?? []);
  };
