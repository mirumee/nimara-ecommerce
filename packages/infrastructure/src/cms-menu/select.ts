import {
  createServiceSelector,
  type ProviderManifest,
} from "#root/lib/create-service-selector";
import { type CMSMenuService } from "#root/use-cases/cms-menu/types";

/**
 * Provider manifests for CMS menus. Shares the CMS provider taxonomy with CMS
 * pages (selected by the same `CMS_SERVICE`); the canonical id catalog is
 * exported from `cms-page/select`.
 */
const MANIFESTS = [
  {
    id: "saleor",
    create: async ({ env, logger }) => {
      const [{ saleorCMSMenuService }, { toSaleorCMSMenuConfig }] =
        await Promise.all([import("./providers"), import("./saleor/config")]);

      return saleorCMSMenuService(toSaleorCMSMenuConfig(env, logger));
    },
  },
  {
    id: "butter-cms",
    create: async ({ env, logger }) => {
      const [{ butterCMSMenuService }, { toButterCMSMenuConfig }] =
        await Promise.all([
          import("./providers"),
          import("./butter-cms/config"),
        ]);

      return butterCMSMenuService(toButterCMSMenuConfig(env, logger));
    },
  },
  {
    id: "dummy",
    create: async ({ env, logger }) => {
      const [{ dummyCMSMenuService }, { toDummyCMSMenuConfig }] =
        await Promise.all([import("./providers"), import("./dummy/config")]);

      return dummyCMSMenuService(toDummyCMSMenuConfig(env, logger));
    },
  },
] as const satisfies readonly ProviderManifest<CMSMenuService, string>[];

const selector = createServiceSelector(MANIFESTS);

export const createCMSMenuService = selector.create;
