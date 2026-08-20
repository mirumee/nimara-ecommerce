import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import { ChannelsQueryDocument } from "@/graphql/generated/client";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { type SaleorClient } from "@/lib/saleor/client";
import { maskString } from "@/lib/security";

// What the config UI renders per channel.
export type ConfigFormData = Record<
  string,
  {
    currency: string;
    name: string;
    publicKey: string;
    secretKey: string;
    webhookId?: string;
    webhookSecretKey?: string;
  }
>;

export const getConfigFormDataUseCase =
  ({
    appConfigService,
    joseAuthService,
    saleorClient,
  }: {
    appConfigService: AppConfigService;
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

    const configResult = await appConfigService.getPaymentGatewayConfig({
      saleorDomain,
    });

    if (!configResult.ok) {
      return configResult;
    }

    const config = configResult.data;

    const formData =
      channels?.reduce<ConfigFormData>((acc, { currencyCode, name, slug }) => {
        const gatewayConfig = (config?.[slug] ??
          {}) as PaymentGatewayConfig[string];

        acc[slug] = {
          currency: currencyCode,
          name,
          webhookId: gatewayConfig.webhookId,
          webhookSecretKey: gatewayConfig.webhookSecretKey
            ? maskString({
                visibleChars: 10,
                str: gatewayConfig.webhookSecretKey,
              })
            : undefined,
          publicKey: gatewayConfig.publicKey,
          secretKey: gatewayConfig.secretKey,
        };

        return acc;
      }, {}) ?? {};

    return ok(formData);
  };
