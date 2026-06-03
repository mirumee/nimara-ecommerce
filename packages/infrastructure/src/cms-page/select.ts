import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

/**
 * Provider manifests for CMS pages. The CMS provider id catalog
 * ({@link CMS_PROVIDER_IDS}) is derived here and shared with CMS menus and the
 * storefront selection enum.
 */
const MANIFESTS = [
  {
    id: "saleor",
    create: async ({ env, logger }) => {
      const [{ saleorCMSPageService }, { toSaleorCMSPageConfig }] =
        await Promise.all([import("./providers"), import("./saleor/config")]);

      return saleorCMSPageService(toSaleorCMSPageConfig(env, logger));
    },
  },
  {
    id: "butter-cms",
    create: async ({ env, logger }) => {
      const [{ butterCMSPageService }, { toButterCMSPageConfig }] =
        await Promise.all([
          import("./providers"),
          import("./butter-cms/config"),
        ]);

      return butterCMSPageService(toButterCMSPageConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const [{ dummyCMSPageService }, { toDummyCMSPageConfig }] =
        await Promise.all([import("./providers"), import("./dummy/config")]);

      return dummyCMSPageService(toDummyCMSPageConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<CMSPageService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createCMSPageService = selector.create;
export const CMS_PROVIDER_IDS = selector.ids;
export type CMSProviderId = (typeof CMS_PROVIDER_IDS)[number];
