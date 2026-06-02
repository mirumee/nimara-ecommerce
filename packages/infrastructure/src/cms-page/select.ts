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
 * Resolves and instantiates the CMS page service for the selected provider.
 * The provider catalog and wiring live here; apps only pass the selected id
 * plus config. The exhaustive `switch` makes adding an id to
 * {@link CMSProviderId} a compile error until a branch is added.
 */
export const createCMSPageService = async (
  provider: CMSProviderId,
  config: CMSPageServiceConfig,
): Promise<CMSPageService> => {
  switch (provider) {
    case "saleor": {
      if (!config.saleor) {
        throw new Error(
          "CMS provider 'saleor' is selected but its configuration is missing.",
        );
      }

      const { saleorCMSPageService } = await import("./providers");

      return saleorCMSPageService({ ...config.saleor, logger: config.logger });
    }
    case "butter-cms": {
      if (!config.butterCMS) {
        throw new Error(
          "CMS provider 'butter-cms' is selected but its token is not configured.",
        );
      }

      const { butterCMSPageService } = await import("./providers");

      return butterCMSPageService({
        ...config.butterCMS,
        logger: config.logger,
      });
    }
    case "dummy": {
      const { dummyCMSPageService } = await import("./providers");

      return dummyCMSPageService({ logger: config.logger });
    }
    default: {
      const _exhaustive: never = provider;

      throw new Error(`Unknown CMS provider: ${String(_exhaustive)}`);
    }
  }
};
