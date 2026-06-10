import { createKeyedServiceSelector } from "#root/lib/create-service-selector";
import { CMS_PROVIDER_IDS } from "#root/providers/cms";
import { type CMSMenuService } from "#root/use-cases/cms-menu/types";

import {
  butterCMSMenuEnvSchema,
  toButterCMSMenuConfig,
} from "./butter-cms/config";
import { toDummyCMSMenuConfig } from "./dummy/config";
import { saleorCMSMenuEnvSchema, toSaleorCMSMenuConfig } from "./saleor/config";

/**
 * Provider manifests for CMS menus, keyed by the canonical CMS provider catalog
 * ({@link CMS_PROVIDER_IDS}) shared with CMS pages — both are selected by one
 * `CMS_SERVICE` env, so keying by the catalog makes drift between the two a
 * compile error. {@link cmsMenuProviders} is the describe-list used by the
 * integration preflight.
 */
const selector = createKeyedServiceSelector<
  CMSMenuService,
  typeof CMS_PROVIDER_IDS
>(CMS_PROVIDER_IDS, {
  saleor: {
    configSchema: saleorCMSMenuEnvSchema,
    create: async ({ env, logger }) => {
      const { saleorCMSMenuService } = await import("./providers");

      return saleorCMSMenuService(toSaleorCMSMenuConfig(env, logger));
    },
  },
  "butter-cms": {
    configSchema: butterCMSMenuEnvSchema,
    create: async ({ env, logger }) => {
      const { butterCMSMenuService } = await import("./providers");

      return butterCMSMenuService(toButterCMSMenuConfig(env, logger));
    },
  },
  dummy: {
    create: async ({ env, logger }) => {
      const { dummyCMSMenuService } = await import("./providers");

      return dummyCMSMenuService(toDummyCMSMenuConfig(env, logger));
    },
  },
});

export const createCMSMenuService = selector.create;
export const cmsMenuProviders = selector.providers;
