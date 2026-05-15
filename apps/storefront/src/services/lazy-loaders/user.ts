import type { Logger } from "@nimara/infrastructure/logging/types";
import type { UserService } from "@nimara/infrastructure/user/types";

import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader function for the user service.
 * This function is only used by the service registry.
 * @internal
 */
export const createUserServiceLoader = (logger: Logger) => {
  let userServiceInstance: UserService | null = null;

  return async (): Promise<UserService> => {
    if (userServiceInstance) {
      return userServiceInstance;
    }

    const { saleorUserService } =
      await import("@nimara/infrastructure/user/index");

    userServiceInstance = saleorUserService({
      apiURL: getRequiredSaleorApiUrl("user service"),
      logger,
    });

    return userServiceInstance;
  };
};
