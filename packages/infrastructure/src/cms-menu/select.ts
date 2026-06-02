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
 * Resolves and instantiates the CMS menu service for the selected provider.
 * The provider catalog and wiring live here; apps only pass the selected id
 * plus config. The exhaustive `switch` makes adding an id to
 * {@link CMSProviderId} a compile error until a branch is added.
 */
export const createCMSMenuService = async (
  provider: CMSProviderId,
  config: CMSMenuServiceConfig,
): Promise<CMSMenuService> => {
  switch (provider) {
    case "saleor": {
      if (!config.saleor) {
        throw new Error(
          "CMS provider 'saleor' is selected but its configuration is missing.",
        );
      }

      const { saleorCMSMenuService } = await import("./providers");

      return saleorCMSMenuService({ ...config.saleor, logger: config.logger });
    }
    case "butter-cms": {
      if (!config.butterCMS) {
        throw new Error(
          "CMS provider 'butter-cms' is selected but its token is not configured.",
        );
      }

      const { butterCMSMenuService } = await import("./providers");

      return butterCMSMenuService({
        ...config.butterCMS,
        logger: config.logger,
      });
    }
    case "dummy": {
      const { dummyCMSMenuService } = await import("./providers");

      return dummyCMSMenuService({ logger: config.logger });
    }
    default: {
      const _exhaustive: never = provider;

      throw new Error(`Unknown CMS provider: ${String(_exhaustive)}`);
    }
  }
};
