import { type createClient } from "@vercel/kv";

import { COMMON_CLIENT_CONFIG } from "#config/common/client";

import { type SaleorBaseConfig, saleorBaseConfig } from "./schema";
import type {
  SaleorConfigProviderFactory,
  SaleorConfigProviderFactoryMethods,
} from "./types";
import { validateDomain } from "./utils";

type Config = SaleorBaseConfig;
type ConfigProviderMethods = SaleorConfigProviderFactoryMethods<Config>;

// TODO: FIXME: Could we use KVConfigProvider here?
export const SaleorKVConfigProvider: SaleorConfigProviderFactory<
  {
    client: ReturnType<typeof createClient>;
    configKey: string;
  },
  Config
> = ({ client, configKey }) => {
  const _extractData = async () => {
    const data = await client.hgetall(configKey);

    if (data) {
      return saleorBaseConfig.parse(data);
    }

    return null;
  };

  const getBySaleorAppId: ConfigProviderMethods["getBySaleorAppId"] =
    async () => await _extractData();

  const getBySaleorDomain: ConfigProviderMethods["getBySaleorDomain"] = async ({
    saleorDomain,
  }) => {
    validateDomain({
      saleorDomain,
      allowedSaleorDomain: COMMON_CLIENT_CONFIG.SALEOR_DOMAIN,
    });

    return await _extractData();
  };

  const createOrUpdate: ConfigProviderMethods["createOrUpdate"] = async (
    opts,
  ) => {
    validateDomain({
      saleorDomain: opts.saleorDomain,
      allowedSaleorDomain: COMMON_CLIENT_CONFIG.SALEOR_DOMAIN,
    });

    let config = await getBySaleorDomain({
      saleorDomain: opts.saleorDomain,
    });

    if (config) {
      config.authToken = opts.authToken;
      config.saleorAppId = opts.saleorAppId;
      config.saleorDomain = opts.saleorDomain;
    } else {
      config = saleorBaseConfig.parse(opts);
    }

    await client.hset(configKey, config);

    return saleorBaseConfig.parse(config);
  };

  return {
    getBySaleorAppId,
    getBySaleorDomain,
    createOrUpdate,
  };
};
