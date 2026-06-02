import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type CMSProviderId } from "#root/providers-catalog";
import { type CMSMenuService } from "#root/use-cases/cms-menu/types";

/**
 * Input for the CMS menu selector. The app forwards the (server-side) env record
 * and a logger; each provider validates only the env it needs via its own
 * co-located schema.
 */
export type CMSMenuSelectInput = {
  env: Record<string, string | undefined>;
  logger: Logger;
};

/**
 * Resolves and instantiates the CMS menu service for the selected provider. The
 * provider catalog, wiring, and per-provider config contracts all live in
 * infrastructure; the app only passes the selected id, env, and logger.
 */
export const createCMSMenuService = createServiceSelector<
  CMSMenuService,
  CMSMenuSelectInput,
  CMSProviderId
>({
  saleor: async ({ env, logger }) => {
    const [{ saleorCMSMenuService }, { toSaleorCMSMenuConfig }] =
      await Promise.all([import("./providers"), import("./saleor/config")]);

    return saleorCMSMenuService(toSaleorCMSMenuConfig(env, logger));
  },
  "butter-cms": async ({ env, logger }) => {
    const [{ butterCMSMenuService }, { toButterCMSMenuConfig }] =
      await Promise.all([import("./providers"), import("./butter-cms/config")]);

    return butterCMSMenuService(toButterCMSMenuConfig(env, logger));
  },
  dummy: async ({ env, logger }) => {
    const [{ dummyCMSMenuService }, { toDummyCMSMenuConfig }] =
      await Promise.all([import("./providers"), import("./dummy/config")]);

    return dummyCMSMenuService(toDummyCMSMenuConfig(env, logger));
  },
});
