import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { emptyChannelConfigSet } from "@nimara/domain/objects/SaleorApp";
import {
  fetchSaleorChannels,
  type SaleorChannel,
} from "@nimara/infrastructure/apps/saleor/channels";
import { type SaleorAppConfigService } from "@nimara/infrastructure/apps/saleor/config-repository";
import {
  maskChannelSecrets,
  pruneChannelConfigSet,
} from "@nimara/lib/saleor/app-config";
import { saleorUrlFromDomain } from "@nimara/lib/saleor/url";

import {
  type AppSettings,
  type ChannelConfig,
  SECRET_FIELDS,
} from "@/domain/app-config";

// What the config UI renders: the channels to configure and the stored config.
export type ConfigFormData = {
  channels: SaleorChannel[];
  config: AppSettings;
};

export const getConfigFormDataUseCase =
  ({
    appConfigService,
  }: {
    appConfigService: SaleorAppConfigService<AppSettings>;
  }) =>
  async ({
    saleorDomain,
  }: {
    saleorDomain: string;
  }): AsyncResult<ConfigFormData> => {
    const installation = await appConfigService.getBySaleorDomain({
      saleorDomain,
    });

    if (!installation.ok) {
      return installation;
    }

    const channelsResult = await fetchSaleorChannels({
      authToken: installation.data?.authToken,
      saleorUrl: saleorUrlFromDomain(saleorDomain),
    });

    if (!channelsResult.ok) {
      return channelsResult;
    }

    const channels = channelsResult.data;

    // A channel renamed or removed in Saleor leaves the operator to pick again.
    const pruned = pruneChannelConfigSet({
      channelSlugs: channels.map(({ slug }) => slug),
      configSet:
        installation.data?.settings ?? emptyChannelConfigSet<ChannelConfig>(),
    });

    const mask = (config: ChannelConfig) =>
      maskChannelSecrets({ config, secretFields: SECRET_FIELDS });

    return ok({
      channels,
      config: {
        channelOverrides: Object.fromEntries(
          Object.entries(pruned.channelOverrides).map(([slug, config]) => [
            slug,
            mask(config),
          ]),
        ),
        default: pruned.default ? mask(pruned.default) : null,
        defaultChannelSlug: pruned.defaultChannelSlug,
      },
    });
  };
