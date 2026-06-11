import { createKeyedServiceSelector } from "#root/lib/create-service-selector";
import { CMS_PROVIDER_IDS } from "#root/providers/cms";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

import {
  butterCMSPageEnvSchema,
  toButterCMSPageConfig,
} from "./butter-cms/config";
import { toDummyCMSPageConfig } from "./dummy/config";
import { saleorCMSPageEnvSchema, toSaleorCMSPageConfig } from "./saleor/config";

/**
 * Provider manifests for CMS pages, keyed by the canonical CMS provider catalog
 * ({@link CMS_PROVIDER_IDS}). Keying by the catalog forces this capability to
 * cover exactly the same providers as CMS menus — both are selected by one
 * `CMS_SERVICE` env. {@link cmsPageProviders} is the describe-list used by the
 * integration preflight.
 */
const selector = createKeyedServiceSelector<
  CMSPageService,
  typeof CMS_PROVIDER_IDS
>(CMS_PROVIDER_IDS, {
  saleor: {
    configSchema: saleorCMSPageEnvSchema,
    create: async ({ env, logger }) => {
      const { saleorCMSPageService } = await import("./providers");

      return saleorCMSPageService(toSaleorCMSPageConfig(env, logger));
    },
  },
  "butter-cms": {
    configSchema: butterCMSPageEnvSchema,
    create: async ({ env, logger }) => {
      const { butterCMSPageService } = await import("./providers");

      return butterCMSPageService(toButterCMSPageConfig(env, logger));
    },
  },
  dummy: {
    create: async ({ env, logger }) => {
      const { dummyCMSPageService } = await import("./providers");

      return dummyCMSPageService(toDummyCMSPageConfig(env, logger));
    },
  },
});

export const createCMSPageService = selector.create;
export const cmsPageProviders = selector.providers;
export { CMS_PROVIDER_IDS, type CMSProviderId } from "#root/providers/cms";
