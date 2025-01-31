import { type SaleorAppConfig, saleorAppConfig } from "./schema";
import type {
  SaleorAppConfigProviderFactory,
  SaleorAppConfigProviderFactoryMethods,
} from "./types";
import { validateDomain } from "./util";

const VERCEL_API_URL_BASE = `https://api.vercel.com/v1/edge-config`;

type Config = SaleorAppConfig;
type ConfigProviderMethods = SaleorAppConfigProviderFactoryMethods<Config>;

export const SaleorEdgeConfigProvider: SaleorAppConfigProviderFactory<
  {
    configKey: string;
    saleorDomain: string;
    vercelAccessToken: string;
    vercelEdgeDatabaseId: string;
    vercelTeamId: string;
  },
  Config
> = ({
  vercelEdgeDatabaseId,
  vercelAccessToken,
  configKey,
  vercelTeamId,
  saleorDomain,
}) => {
  const __extractData = async (): Promise<SaleorAppConfig | null> => {
    const result = await fetch(
      `${VERCEL_API_URL_BASE}/${vercelEdgeDatabaseId}/item/${configKey}?teamId=${vercelTeamId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${vercelAccessToken}` },
      },
    );

    if (result.ok) {
      if (result.status === 204) {
        return null;
      }

      const data = (await result.json()).value;

      if (data) {
        return saleorAppConfig.parse(data);
      }

      return null;
    }

    throw new Error("Failed to fetch edge config.", {
      cause: { status: result.status, text: result.statusText },
    });
  };

  const getBySaleorAppId: ConfigProviderMethods["getBySaleorAppId"] = async ({
    saleorAppId,
  }) => {
    const data = await __extractData();

    if (data && data.saleorAppId === saleorAppId) {
      return data;
    }

    return null;
  };

  const getBySaleorDomain: ConfigProviderMethods["getBySaleorDomain"] = async ({
    saleorDomain,
  }) => {
    validateDomain({
      saleorDomain,
      allowedSaleorDomain: saleorDomain,
    });

    return __extractData();
  };

  const createOrUpdate: ConfigProviderMethods["createOrUpdate"] = async (
    opts,
  ) => {
    validateDomain({
      saleorDomain: opts.saleorDomain,
      allowedSaleorDomain: saleorDomain,
    });

    let config = await getBySaleorDomain({
      saleorDomain: opts.saleorDomain,
    });

    if (config) {
      config.authToken = opts.authToken;
      config.saleorAppId = opts.saleorAppId;
      config.saleorDomain = opts.saleorDomain;
      config.stripeConfig = opts.stripeConfig;
    } else {
      config = saleorAppConfig.parse(opts);
    }

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
              value: config,
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

    return saleorAppConfig.parse(config);
  };

  return {
    getBySaleorAppId,
    getBySaleorDomain,
    createOrUpdate,
  };
};
