import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { type SaleorAppConfigService } from "@nimara/infrastructure/apps/saleor/config-repository";
import { withStoredSecrets } from "@nimara/lib/saleor/app-config";

import {
  type AppSettings,
  type ChannelConfig,
  SECRET_FIELDS,
} from "@/domain/app-config";

export const saveConfigUseCase =
  ({
    appConfigService,
  }: {
    appConfigService: SaleorAppConfigService<AppSettings>;
  }) =>
  async ({
    data,
    saleorDomain,
  }: {
    data: {
      channelOverrides: Record<string, ChannelConfig>;
      default: ChannelConfig;
      defaultChannelSlug: string | null;
    };
    saleorDomain: string;
  }): AsyncResult<void> => {
    const stored = await appConfigService.getSettings({ saleorDomain });

    if (!stored.ok) {
      return stored;
    }

    const resolve = (
      incoming: ChannelConfig,
      storedConfig: ChannelConfig | null | undefined,
    ) =>
      withStoredSecrets({
        incoming,
        secretFields: SECRET_FIELDS,
        stored: storedConfig,
      });

    const updated: AppSettings = {
      channelOverrides: Object.fromEntries(
        Object.entries(data.channelOverrides).map(([slug, config]) => [
          slug,
          resolve(config, stored.data?.channelOverrides[slug]),
        ]),
      ),
      default: resolve(data.default, stored.data?.default),
      defaultChannelSlug: data.defaultChannelSlug,
    };

    const saved = await appConfigService.updateSettings({
      saleorDomain,
      settings: updated,
    });

    if (!saved.ok) {
      return saved;
    }

    return ok(undefined);
  };
