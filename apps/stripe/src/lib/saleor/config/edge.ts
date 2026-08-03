import merge from "lodash/merge";

import {
  parseStoredConfig,
  paymentGatewayConfig,
  type SaleorAppConfig,
  saleorAppConfig,
  type SaleorMultiTenantAppConfig,
} from "./schema";
import type {
  SaleorAppConfigProviderFactory,
  SaleorAppConfigProviderFactoryMethods,
} from "./types";

const VERCEL_API_URL_BASE = `https://api.vercel.com/v1/edge-config`;

type Config = SaleorAppConfig;
type ConfigProviderMethods = SaleorAppConfigProviderFactoryMethods<Config>;

export const SaleorEdgeConfigProvider: SaleorAppConfigProviderFactory<
  {
    configKey: string;
    vercelAccessToken: string;
    vercelEdgeDatabaseId: string;
    vercelTeamId: string;
  },
  Config
> = ({ vercelEdgeDatabaseId, vercelAccessToken, configKey, vercelTeamId }) => {
  const __extractData = async (): Promise<SaleorMultiTenantAppConfig> => {
    const result = await fetch(
      `${VERCEL_API_URL_BASE}/${vercelEdgeDatabaseId}/item/${configKey}?teamId=${vercelTeamId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${vercelAccessToken}` },
      },
    );

    if (result.ok) {
      if (result.status === 204) {
        return {};
      }

      const data = (await result.json()).value;

      if (data) {
        return parseStoredConfig(data);
      }

      return {};
    }

    throw new Error("Failed to fetch edge config.", {
      cause: { status: result.status, text: result.statusText },
    });
  };

  const __upsertData = async ({
    configs,
  }: {
    configs: SaleorMultiTenantAppConfig;
  }) => {
    const result = await fetch(
      `${VERCEL_API_URL_BASE}/${vercelEdgeDatabaseId}/items?teamId=${vercelTeamId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vercelAccessToken}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          items: [
            {
              operation: "upsert",
              key: configKey,
              value: configs,
            },
          ],
        }),
      },
    );

    if (!result.ok) {
      throw new Error("Failed to update edge config.", {
        cause: { status: result.status, text: result.statusText },
      });
    }
  };

  const getBySaleorAppId: ConfigProviderMethods["getBySaleorAppId"] = async ({
    saleorAppId,
  }) => {
    const configs = await __extractData();

    return (
      Object.values(configs).find(
        (config) => config.saleorAppId === saleorAppId,
      ) ?? null
    );
  };

  const getBySaleorDomain: ConfigProviderMethods["getBySaleorDomain"] = async ({
    saleorDomain,
  }) => {
    const configs = await __extractData();

    return configs[saleorDomain] ?? null;
  };

  const createOrUpdate: ConfigProviderMethods["createOrUpdate"] = async (
    opts,
  ) => {
    const configs = await __extractData();
    const current = configs[opts.saleorDomain];
    const config = saleorAppConfig.parse(
      current
        ? {
            ...opts,
            paymentGatewayConfig: merge(
              current.paymentGatewayConfig,
              opts.paymentGatewayConfig,
            ),
          }
        : opts,
    );

    await __upsertData({
      configs: { ...configs, [opts.saleorDomain]: config },
    });

    return config;
  };

  const updatePaymentGatewayConfig: ConfigProviderMethods["updatePaymentGatewayConfig"] =
    async ({ saleorDomain, data }) => {
      const configs = await __extractData();
      const config = configs[saleorDomain];

      if (!config) {
        throw new Error(`Missing config for ${saleorDomain} domain.`);
      }

      config.paymentGatewayConfig = paymentGatewayConfig.parse(data);

      await __upsertData({ configs: { ...configs, [saleorDomain]: config } });

      return config.paymentGatewayConfig;
    };

  const getPaymentGatewayConfigForChannel: ConfigProviderMethods["getPaymentGatewayConfigForChannel"] =
    async ({ saleorDomain, channelSlug }) => {
      const config = await getBySaleorDomain({ saleorDomain });

      if (!config) {
        throw new Error(`Missing config for ${saleorDomain} domain.`);
      }

      const gatewayConfig = config.paymentGatewayConfig[channelSlug];

      if (!gatewayConfig) {
        throw new Error(`Missing config for ${saleorDomain} - ${channelSlug}.`);
      }

      return gatewayConfig;
    };

  return {
    getBySaleorAppId,
    getBySaleorDomain,
    createOrUpdate,
    updatePaymentGatewayConfig,
    getPaymentGatewayConfigForChannel,
  };
};
