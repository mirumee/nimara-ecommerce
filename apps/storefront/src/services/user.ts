import { type UserService } from "@nimara/infrastructure/user/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: UserService | null = null;

/**
 * Loads the Saleor UserService instance.
 * @returns A promise that resolves to the UserService instance.
 */
export const getUserService = async (): Promise<UserService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorUserService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/user/index"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorUserService({
    apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
