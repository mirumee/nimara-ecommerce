import { type Logger } from "@nimara/foundation/logging/types";
import { type AddressService } from "@nimara/infrastructure/address/types";

import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader function for the address service.
 * This function is only used by the service registry.
 * @internal
 * @param logger - The logger to use for the address service.
 * @returns A promise that resolves to the AddressService instance.
 */
export const createAddressServiceLoader = (logger: Logger) => {
  let addressServiceInstance: AddressService | null = null;

  return async (): Promise<AddressService> => {
    if (addressServiceInstance) {
      return addressServiceInstance;
    }

    const { saleorAddressService } =
      await import("@nimara/infrastructure/address/index");

    addressServiceInstance = saleorAddressService({
      apiURL: getRequiredSaleorApiUrl("address service"),
      logger,
    });

    return addressServiceInstance;
  };
};
