import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

import {
  butterCMSPageEnvSchema,
  toButterCMSPageConfig,
} from "./butter-cms/config";
import { toDummyCMSPageConfig } from "./dummy/config";
import { saleorCMSPageEnvSchema, toSaleorCMSPageConfig } from "./saleor/config";

/**
 * Provider manifests for CMS pages. The CMS provider id catalog
 * ({@link CMS_PROVIDER_IDS}) and {@link cmsPageProviders} describe-list are
 * derived here and shared with CMS menus and the storefront selection enum.
 */
const MANIFESTS = [
  {
    id: "saleor",
    configSchema: saleorCMSPageEnvSchema,
    create: async ({ env, logger }) => {
      const { saleorCMSPageService } = await import("./providers");

      return saleorCMSPageService(toSaleorCMSPageConfig(env, logger));
    },
  },
  {
    id: "butter-cms",
    configSchema: butterCMSPageEnvSchema,
    create: async ({ env, logger }) => {
      const { butterCMSPageService } = await import("./providers");

      return butterCMSPageService(toButterCMSPageConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const { dummyCMSPageService } = await import("./providers");

      return dummyCMSPageService(toDummyCMSPageConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<CMSPageService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createCMSPageService = selector.create;
export const CMS_PROVIDER_IDS = selector.ids;
export const cmsPageProviders = selector.providers;
export type CMSProviderId = (typeof CMS_PROVIDER_IDS)[number];
