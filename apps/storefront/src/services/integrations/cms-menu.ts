import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";

import { clientEnvs } from "@/envs/client";
import { isSaleorConfigured } from "@/services/lazy-loaders/empty-services";
import {
  getRequiredButterCMSApiKey,
  getRequiredSaleorApiUrl,
} from "@/services/lazy-loaders/required-env";

import type { ProviderRegistry, ProviderResolver } from "./types";

export const CMS_MENU_PROVIDERS = {
  saleor: async (logger) => {
    const { saleorCMSMenuService } =
      await import("@nimara/infrastructure/cms-menu/providers");

    return saleorCMSMenuService({
      apiURL: getRequiredSaleorApiUrl("CMS menu service"),
      logger,
    });
  },
  "butter-cms": async (logger) => {
    const { butterCMSMenuService } =
      await import("@nimara/infrastructure/cms-menu/providers");

    return butterCMSMenuService({
      token: getRequiredButterCMSApiKey("CMS menu service"),
      logger,
    });
  },
} satisfies ProviderRegistry<CMSMenuService>;

export const resolveCMSMenuProvider: ProviderResolver<
  typeof CMS_MENU_PROVIDERS
> = () => {
  const provider = clientEnvs.CMS_SERVICE;

  if (provider === "saleor" && !isSaleorConfigured) {
    return null;
  }

  return provider;
};
