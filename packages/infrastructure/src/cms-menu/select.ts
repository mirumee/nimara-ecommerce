import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type CMSMenuService } from "#root/use-cases/cms-menu/types";

import {
  butterCMSMenuEnvSchema,
  toButterCMSMenuConfig,
} from "./butter-cms/config";
import { toDummyCMSMenuConfig } from "./dummy/config";
import { saleorCMSMenuEnvSchema, toSaleorCMSMenuConfig } from "./saleor/config";

/**
 * Provider manifests for CMS menus. Shares the CMS provider taxonomy with CMS
 * pages (selected by the same `CMS_SERVICE`); the canonical id catalog is
 * exported from `cms-page/select`. {@link cmsMenuProviders} is the describe-list
 * used by the integration preflight.
 */
const MANIFESTS = [
  {
    id: "saleor",
    configSchema: saleorCMSMenuEnvSchema,
    create: async ({ env, logger }) => {
      const { saleorCMSMenuService } = await import("./providers");

      return saleorCMSMenuService(toSaleorCMSMenuConfig(env, logger));
    },
  },
  {
    id: "butter-cms",
    configSchema: butterCMSMenuEnvSchema,
    create: async ({ env, logger }) => {
      const { butterCMSMenuService } = await import("./providers");

      return butterCMSMenuService(toButterCMSMenuConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const { dummyCMSMenuService } = await import("./providers");

      return dummyCMSMenuService(toDummyCMSMenuConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<CMSMenuService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createCMSMenuService = selector.create;
export const cmsMenuProviders = selector.providers;
