import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { clientEnvs } from "@/envs/client";
import { isSaleorConfigured } from "@/services/lazy-loaders/empty-services";
import {
  getRequiredButterCMSApiKey,
  getRequiredSaleorApiUrl,
} from "@/services/lazy-loaders/required-env";

import type { ProviderRegistry, ProviderResolver } from "./types";

export const CMS_PAGE_PROVIDERS = {
  saleor: async (logger) => {
    const { saleorCMSPageService } =
      await import("@nimara/infrastructure/cms-page/providers");

    return saleorCMSPageService({
      apiURL: getRequiredSaleorApiUrl("CMS page service"),
      logger,
    });
  },
  "butter-cms": async (logger) => {
    const { butterCMSPageService } =
      await import("@nimara/infrastructure/cms-page/providers");

    return butterCMSPageService({
      token: getRequiredButterCMSApiKey("CMS page service"),
      logger,
    });
  },
} satisfies ProviderRegistry<CMSPageService>;

export const resolveCMSPageProvider: ProviderResolver<
  typeof CMS_PAGE_PROVIDERS
> = () => {
  const provider = clientEnvs.CMS_SERVICE;

  if (provider === "saleor" && !isSaleorConfigured) {
    return null;
  }

  return provider;
};
