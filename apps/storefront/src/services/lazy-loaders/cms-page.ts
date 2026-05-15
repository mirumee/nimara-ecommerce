import type { Logger } from "@nimara/infrastructure/logging/types";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { getRequiredSaleorApiUrl } from "./required-env";

/**
 * Creates a lazy loader function for the CMS page service.
 * This function is only used by the service registry.
 * @internal
 */
export const createCMSPageServiceLoader = (logger: Logger) => {
  let cmsServiceInstance: CMSPageService | null = null;

  return async (): Promise<CMSPageService> => {
    if (cmsServiceInstance) {
      return cmsServiceInstance;
    }

    const { saleorCMSPageService } =
      await import("@nimara/infrastructure/cms-page/providers");

    cmsServiceInstance = saleorCMSPageService({
      apiURL: getRequiredSaleorApiUrl("CMS page service"),
      logger,
    });

    return cmsServiceInstance;
  };
};
