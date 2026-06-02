import { createServiceSelector } from "#root/lib/create-service-selector";
import { type Logger } from "#root/logging/types";
import { type CMSProviderId } from "#root/providers-catalog";
import { type CMSPageService } from "#root/use-cases/cms-page/types";

/**
 * Input for the CMS page selector. The app forwards the (server-side) env record
 * and a logger; each provider validates only the env it needs via its own
 * co-located schema.
 */
export type CMSPageSelectInput = {
  env: Record<string, string | undefined>;
  logger: Logger;
};

/**
 * Resolves and instantiates the CMS page service for the selected provider. The
 * provider catalog, wiring, and per-provider config contracts all live in
 * infrastructure; the app only passes the selected id, env, and logger.
 */
export const createCMSPageService = createServiceSelector<
  CMSPageService,
  CMSPageSelectInput,
  CMSProviderId
>({
  saleor: async ({ env, logger }) => {
    const [{ saleorCMSPageService }, { toSaleorCMSPageConfig }] =
      await Promise.all([import("./providers"), import("./saleor/config")]);

    return saleorCMSPageService(toSaleorCMSPageConfig(env, logger));
  },
  "butter-cms": async ({ env, logger }) => {
    const [{ butterCMSPageService }, { toButterCMSPageConfig }] =
      await Promise.all([import("./providers"), import("./butter-cms/config")]);

    return butterCMSPageService(toButterCMSPageConfig(env, logger));
  },
  dummy: async ({ env, logger }) => {
    const [{ dummyCMSPageService }, { toDummyCMSPageConfig }] =
      await Promise.all([import("./providers"), import("./dummy/config")]);

    return dummyCMSPageService(toDummyCMSPageConfig(env, logger));
  },
});
