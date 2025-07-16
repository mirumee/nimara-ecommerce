import { type AddressService } from "@nimara/infrastructure/address/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: AddressService | null = null;

/**
 * Loads the Saleor AddressService instance.
 * @returns A promise that resolves to the AddressService instance.
 */
export const getAddressService = async (): Promise<AddressService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorAddressService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/address/index"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorAddressService({
    apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
