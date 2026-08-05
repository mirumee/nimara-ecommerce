import { createSaleorAppConfigProvider } from "./provider";
import {
  parseStoredConfig,
  type SaleorAppConfig,
  type SaleorMultiTenantAppConfig,
} from "./schema";
import type { SaleorAppConfigProviderFactory } from "./types";

const VERCEL_API_URL_BASE = `https://api.vercel.com/v1/edge-config`;

type Config = SaleorAppConfig;

export const SaleorEdgeConfigProvider: SaleorAppConfigProviderFactory<
  {
    configKey: string;
    vercelAccessToken: string;
    vercelEdgeDatabaseId: string;
    vercelTeamId: string;
  },
  Config
> = ({ vercelEdgeDatabaseId, vercelAccessToken, configKey, vercelTeamId }) => {
  const read = async (): Promise<SaleorMultiTenantAppConfig> => {
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

  const write = async (configs: SaleorMultiTenantAppConfig) => {
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

  return createSaleorAppConfigProvider({ read, write });
};
