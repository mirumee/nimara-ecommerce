import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type CMSProviderId } from "#root/providers-catalog";
import { type CMSMenuService } from "#root/use-cases/cms-menu/types";

import type {
  ButterCMSMenuServiceConfig,
  SaleorCMSMenuServiceConfig,
} from "./types";

/**
 * Configuration bag for the CMS menu service. Each provider reads only the
 * section it needs; the consuming app supplies the values it owns.
 */
export type CMSMenuServiceConfig = {
  butterCMS?: Pick<ButterCMSMenuServiceConfig, "token">;
  logger: Logger;
  saleor?: Pick<SaleorCMSMenuServiceConfig, "apiURL">;
};

/**
 * Resolves and instantiates the CMS menu service for the selected provider. The
 * provider catalog and wiring live here; apps only pass the selected id plus
 * config.
 */
export const createCMSMenuService = createServiceSelector<
  CMSMenuService,
  CMSMenuServiceConfig,
  CMSProviderId
>({
  saleor: async (config) => {
    if (!config.saleor) {
      return null;
    }

    const { saleorCMSMenuService } = await import("./providers");

    return saleorCMSMenuService({ ...config.saleor, logger: config.logger });
  },
  "butter-cms": async (config) => {
    if (!config.butterCMS) {
      return null;
    }

    const { butterCMSMenuService } = await import("./providers");

    return butterCMSMenuService({
      ...config.butterCMS,
      logger: config.logger,
    });
  },
  dummy: async (config) => {
    const { dummyCMSMenuService } = await import("./providers");

    return dummyCMSMenuService({ logger: config.logger });
  },
});
