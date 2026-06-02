import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type CMSProviderId } from "#root/providers-catalog";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

import type {
  ButterCMSPageServiceConfig,
  SaleorCMSPageServiceConfig,
} from "./types";

/**
 * Configuration bag for the CMS page service. Each provider reads only the
 * section it needs; the consuming app supplies the values it owns.
 */
export type CMSPageServiceConfig = {
  butterCMS?: Pick<ButterCMSPageServiceConfig, "token">;
  logger: Logger;
  saleor?: Pick<SaleorCMSPageServiceConfig, "apiURL">;
};

/**
 * Resolves and instantiates the CMS page service for the selected provider. The
 * provider catalog and wiring live here; apps only pass the selected id plus
 * config.
 */
export const createCMSPageService = createServiceSelector<
  CMSPageService,
  CMSPageServiceConfig,
  CMSProviderId
>({
  saleor: async (config) => {
    if (!config.saleor) {
      return null;
    }

    const { saleorCMSPageService } = await import("./providers");

    return saleorCMSPageService({ ...config.saleor, logger: config.logger });
  },
  "butter-cms": async (config) => {
    if (!config.butterCMS) {
      return null;
    }

    const { butterCMSPageService } = await import("./providers");

    return butterCMSPageService({
      ...config.butterCMS,
      logger: config.logger,
    });
  },
  dummy: async (config) => {
    const { dummyCMSPageService } = await import("./providers");

    return dummyCMSPageService({ logger: config.logger });
  },
});
