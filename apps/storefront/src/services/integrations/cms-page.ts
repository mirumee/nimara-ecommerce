import { type CMSProviderId } from "@nimara/infrastructure/providers-catalog";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { clientEnvs } from "@/envs/client";
import { isSaleorConfigured } from "@/services/lazy-loaders/empty-services";
import {
  getRequiredButterCMSApiKey,
  getRequiredSaleorApiUrl,
} from "@/services/lazy-loaders/required-env";

import type { ProviderFactory, ProviderResolver } from "./types";

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
  dummy: async (logger) => {
    const { dummyCMSPageService } =
      await import("@nimara/infrastructure/cms-page/providers");

    return dummyCMSPageService({ logger });
  },
} satisfies Record<CMSProviderId, ProviderFactory<CMSPageService>>;

export const resolveCMSPageProvider: ProviderResolver<
  typeof CMS_PAGE_PROVIDERS
> = () => {
  const provider = clientEnvs.CMS_SERVICE;

  // Nothing real configured: serve dummy data out of the box, except in
  // production where we fall back to the empty service (null).
  if (provider === "saleor" && !isSaleorConfigured) {
    return clientEnvs.ENVIRONMENT === "PRODUCTION" ? null : "dummy";
  }

  return provider;
};
