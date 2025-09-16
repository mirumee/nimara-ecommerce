import { type AuthService } from "@nimara/infrastructure/auth/types";

import { clientEnvs } from "@/envs/client";

import { getStorefrontLogger } from "./lazy-logging";

let loadedService: AuthService | null = null;

/**
 * Loads the Saleor AuthService instance.
 * @returns A promise that resolves to the AuthService instance.
 */
export const getAuthService = async (): Promise<AuthService> => {
  if (loadedService) {
    return loadedService;
  }

  const [{ saleorAuthService }, storefrontLogger] = await Promise.all([
    import("@nimara/infrastructure/auth/index"),
    getStorefrontLogger(),
  ]);

  loadedService = saleorAuthService({
    apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  return loadedService;
};
