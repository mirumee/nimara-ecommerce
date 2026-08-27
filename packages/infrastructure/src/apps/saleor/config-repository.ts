import { type z } from "zod";

import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import {
  type SaleorAppConfig,
  type SaleorAppInstallation,
} from "@nimara/domain/objects/SaleorApp";

import { type ConfigItemRepository } from "#root/config/types";

// The install use-case writes through this without knowing the app's settings.
export const saleorAppConfigRepository = <Settings>({
  configStore,
  settingsSchema,
}: {
  configStore: ConfigItemRepository<
    Record<string, SaleorAppInstallation<Settings>>
  >;
  settingsSchema: z.ZodType<Settings>;
}) => {
  const getBySaleorDomain = async ({
    saleorDomain,
  }: {
    saleorDomain: string;
  }): AsyncResult<SaleorAppInstallation<Settings> | null> => {
    const result = await configStore.get();

    if (!result.ok) {
      return result;
    }

    return ok(result.data?.[saleorDomain] ?? null);
  };

  return {
    getBySaleorDomain,

    // Reinstalling must not drop what the merchant already configured.
    createOrUpdate: async ({
      config,
    }: {
      config: SaleorAppConfig;
    }): AsyncResult<SaleorAppConfig> => {
      const result = await configStore.get();

      if (!result.ok) {
        return result;
      }

      const configs = result.data ?? {};
      const installation = {
        ...config,
        settings: configs[config.saleorDomain]?.settings ?? null,
      };

      const saved = await configStore.upsert({
        value: { ...configs, [config.saleorDomain]: installation },
      });

      if (!saved.ok) {
        return saved;
      }

      return ok(installation);
    },

    getSettings: async ({
      saleorDomain,
    }: {
      saleorDomain: string;
    }): AsyncResult<Settings | null> => {
      const result = await getBySaleorDomain({ saleorDomain });

      if (!result.ok) {
        return result;
      }

      return ok(result.data?.settings ?? null);
    },

    // Parsed on the way in: a shape the app cannot read must not reach the store.
    updateSettings: async ({
      saleorDomain,
      settings,
    }: {
      saleorDomain: string;
      settings: Settings;
    }): AsyncResult<Settings> => {
      const result = await configStore.get();

      if (!result.ok) {
        return result;
      }

      const configs = result.data ?? {};
      const installation = configs[saleorDomain];

      if (!installation) {
        return err([
          {
            code: "SALEOR_APP_CONFIG_NOT_FOUND_ERROR" as const,
            message: `The app is not installed for ${saleorDomain}.`,
            context: { description: "Missing configuration." },
            status: 422,
          },
        ]);
      }

      const parsed = settingsSchema.parse(settings);
      const saved = await configStore.upsert({
        value: {
          ...configs,
          [saleorDomain]: { ...installation, settings: parsed },
        },
      });

      if (!saved.ok) {
        return saved;
      }

      return ok(parsed);
    },
  };
};

export type SaleorAppConfigService<Settings> = ReturnType<
  typeof saleorAppConfigRepository<Settings>
>;
