import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import { ChannelsQueryDocument } from "@/graphql/generated/client";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { type SaleorClient } from "@/lib/saleor/client";
import { maskString } from "@/lib/security";

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
    defaultChannelSlug: string;
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
    defaultChannelSlug,
    joseAuthService,
    saleorClient,
  }: {
    appConfigService: AppConfigService;
    defaultChannelSlug: string;
    joseAuthService: (saleorDomain: string) => JoseAuthService;
    saleorClient: (opts: {
      authToken?: string;
      saleorDomain: string;
    }) => SaleorClient;
  }) =>
  async ({
    accessToken,
    saleorDomain,
  }: {
    accessToken: string;
    saleorDomain: string;
  }): AsyncResult<ConfigFormData> => {
    const jwtResult =
      await joseAuthService(saleorDomain).verifyJwt(accessToken);

    if (!jwtResult.ok) {
      return jwtResult;
    }

    const client = saleorClient({
      authToken: accessToken,
      saleorDomain,
    });

    let channels;

    try {
      ({ channels } = await client.execute(ChannelsQueryDocument));
    } catch (error) {
      return err([
        {
          code: "HTTP_ERROR",
          message: "Failed to fetch channels from Saleor.",
          originalError: error,
        },
      ]);
    }

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

    return ok({
      channels: formChannels,
      config: {
        channelOverrides,
        default: storedConfig?.default
          ? toFormConfig(storedConfig.default)
          : null,
        defaultChannelSlug,
      },
    });
  };
