import type { Logger } from "@nimara/infrastructure/logging/types";
import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";

import { clientEnvs } from "@/envs/client";

/**
 * Creates a lazy loader function for the CMS menu service.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSMenuServiceLoader = (logger: Logger) => {
  let cmsMenuServiceInstance: CMSMenuService | null = null;

  return async (): Promise<CMSMenuService> => {
    if (cmsMenuServiceInstance) {
      return cmsMenuServiceInstance;
    }

    const { saleorCMSMenuService } =
      await import("@nimara/infrastructure/cms-menu/providers");

    cmsMenuServiceInstance = saleorCMSMenuService({
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
      logger,
    });

    return cmsMenuServiceInstance;
  };
};
