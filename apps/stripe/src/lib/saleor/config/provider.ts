import merge from "lodash/merge";

import {
  paymentGatewayConfig,
  type SaleorAppConfig,
  saleorAppConfig,
  type SaleorMultiTenantAppConfig,
} from "./schema";
import type { SaleorAppConfigProviderFactoryMethods } from "./types";

type Config = SaleorAppConfig;
type ConfigProviderMethods = SaleorAppConfigProviderFactoryMethods<Config>;

export type SaleorAppConfigStore = {
  read: () => Promise<SaleorMultiTenantAppConfig>;
  write: (configs: SaleorMultiTenantAppConfig) => Promise<void>;
};

/**
 * Mutations rewrite the whole tenant map, so two overlapping writes can drop a
 * tenant. Accepted: writes only come from installing an app and saving its keys.
 */
export const createSaleorAppConfigProvider = ({
  read,
  write,
}: SaleorAppConfigStore): ConfigProviderMethods => {
  const getBySaleorAppId: ConfigProviderMethods["getBySaleorAppId"] = async ({
    saleorAppId,
  }) => {
    const configs = await read();

    return (
      Object.values(configs).find(
        (config) => config.saleorAppId === saleorAppId,
      ) ?? null
    );
  };

  const getBySaleorDomain: ConfigProviderMethods["getBySaleorDomain"] = async ({
    saleorDomain,
  }) => {
    const configs = await read();

    return configs[saleorDomain] ?? null;
  };

  const createOrUpdate: ConfigProviderMethods["createOrUpdate"] = async (
    opts,
  ) => {
    const configs = await read();
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

    await write({ ...configs, [opts.saleorDomain]: config });

    return config;
  };

  const updatePaymentGatewayConfig: ConfigProviderMethods["updatePaymentGatewayConfig"] =
    async ({ saleorDomain, data }) => {
      const configs = await read();
      const config = configs[saleorDomain];

      if (!config) {
        throw new Error(`Missing config for ${saleorDomain} domain.`);
      }

      config.paymentGatewayConfig = paymentGatewayConfig.parse(data);

      await write({ ...configs, [saleorDomain]: config });

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
