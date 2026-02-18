import { type Logger } from "@nimara/foundation/logging/types";
import { type AddressService } from "@nimara/infrastructure/address/types";

import { clientEnvs } from "@/envs/client";

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
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return addressServiceInstance;
  };
};
