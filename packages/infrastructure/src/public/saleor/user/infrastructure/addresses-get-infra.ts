import { type BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import { loggingService } from "#root/logging/service";

import { UserAddressesQueryDocument } from "../graphql/queries/generated";
import type { AddressesGetInfra, SaleorUserServiceConfig } from "../types";

export const saleorAddressesGetInfra =
  ({ apiURL }: SaleorUserServiceConfig): AddressesGetInfra =>
  async ({ variables: { accessToken }, skip = false }) => {
    if (skip || !accessToken) {
      loggingService.debug("Fetch of user addresses skipped.");

      return [];
    }

    const { data, error } = await graphqlClient(apiURL, accessToken).execute(
      UserAddressesQueryDocument,
    );

    if (!data?.me?.addresses || error) {
      loggingService.error(
        "Failed to fetch user addresses",
        error as BaseError,
      );

      return null;
    }

    return data.me.addresses;
  };
