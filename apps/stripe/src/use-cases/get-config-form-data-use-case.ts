import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { maskString } from "@nimara/foundation/lib/security";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import { ChannelsQueryDocument } from "@/graphql/generated/client";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { type SaleorClient } from "@/infrastructure/saleor/client";

const MASKED_SECRETS_LENGTH = 25;

export type ConfigFormChannel = {
  currency: string;
  name: string;
  slug: string;
};

// What the config UI renders: the channels to configure and the stored config.
export type ConfigFormData = {
  channels: ConfigFormChannel[];
  config: {
    channelOverrides: Record<string, PaymentGatewayConfig>;
    default: PaymentGatewayConfig | null;
    defaultChannelSlug: string | null;
  };
};

/**
 * Neither secret leaves the app in full. The form sends the secret key back
 * blank when the stored one should stay, so a mask is never saved.
 */
const toFormConfig = (config: PaymentGatewayConfig): PaymentGatewayConfig => ({
  ...config,
  secretKey: config.secretKey
    ? maskString({
        maxLength: MASKED_SECRETS_LENGTH,
        visibleChars: 4,
        str: config.secretKey,
      })
    : "",
  webhookSecretKey: config.webhookSecretKey
    ? maskString({
        maxLength: MASKED_SECRETS_LENGTH,
        visibleChars: 4,
        str: config.webhookSecretKey,
      })
    : undefined,
});

export const getConfigFormDataUseCase =
  ({
    appConfigService,
    saleorClient,
  }: {
    appConfigService: AppConfigService;
    saleorClient: (opts: {
      authToken?: string;
      saleorDomain: string;
    }) => SaleorClient;
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

    const client = saleorClient({
      authToken: installation.data?.authToken,
      saleorDomain,
    });

    const channelsResult = await client.execute(ChannelsQueryDocument);

    if (!channelsResult.ok) {
      return channelsResult;
    }

    const { channels } = channelsResult.data;

    const configResult = await appConfigService.getPaymentGatewayConfigSet({
      saleorDomain,
    });

    if (!configResult.ok) {
      return configResult;
    }

    const storedConfig = configResult.data;
    const formChannels =
      channels?.map(({ currencyCode, name, slug }) => ({
        currency: currencyCode,
        name,
        slug,
      })) ?? [];

    // Overrides for removed channels would render as ghost rows and re-save.
    const channelOverrides = formChannels.reduce<
      Record<string, PaymentGatewayConfig>
    >((overrides, { slug }) => {
      const config = storedConfig?.channelOverrides[slug];

      if (config) {
        overrides[slug] = toFormConfig(config);
      }

      return overrides;
    }, {});

    // A channel renamed or removed in Saleor leaves the operator to pick again.
    const storedSlug = storedConfig?.defaultChannelSlug;
    const defaultChannelSlug = formChannels.some(
      ({ slug }) => slug === storedSlug,
    )
      ? storedSlug
      : null;

    return ok({
      channels: formChannels,
      config: {
        channelOverrides,
        default: storedConfig?.default
          ? toFormConfig(storedConfig.default)
          : null,
        defaultChannelSlug: defaultChannelSlug ?? null,
      },
    });
  };
