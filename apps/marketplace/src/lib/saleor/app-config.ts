import { createClient } from "@vercel/edge-config";
import { z } from "zod";

import { getSecret, putSecret } from "@/lib/aws/secrets-manager";
import { config } from "@/lib/config";

/**
 * Saleor App Configuration Schema
 */
export const saleorAppConfigSchema = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfigSchema>;

/**
 * Store structure mapping Saleor domains to their configurations
 */
type AppConfigStore = Record<string, SaleorAppConfig>;

const VERCEL_API_URL_BASE = "https://api.vercel.com/v1/edge-config";

function assertEdgeConfig(
  edgeCfg: typeof config.appConfig.edge,
): asserts edgeCfg is {
  accessToken: string;
  configKey: string;
  edgeConfigConnectionString: string | undefined;
  edgeConfigId: string;
  teamId: string;
} {
  const missing: string[] = [];

  if (!edgeCfg.accessToken) {
    missing.push("VERCEL_ACCESS_TOKEN");
  }

  if (!edgeCfg.teamId) {
    missing.push("VERCEL_TEAM_ID");
  }

  if (!edgeCfg.edgeConfigId) {
    missing.push("VERCEL_EDGE_CONFIG_ID");
  }

  if (!edgeCfg.configKey) {
    missing.push("MARKETPLACE_APP_CONFIG_EDGE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `App config provider is set to "edge" but the following env vars are missing: ${missing.join(", ")}`,
    );
  }
}

async function loadStore(): Promise<AppConfigStore | null> {
  if (config.appConfig.provider === "edge") {
    const edge = config.appConfig.edge;

    // Path 1: SDK (when MARKETPLACE_EDGE_CONFIG is set)
    if (edge.edgeConfigConnectionString) {
      const client = createClient(edge.edgeConfigConnectionString);
      const value = await client.get<AppConfigStore>(edge.configKey);

      return value ?? null;
    }

    // Path 2: REST API (fallback)
    assertEdgeConfig(edge);

    const response = await fetch(
      `${VERCEL_API_URL_BASE}/${edge.edgeConfigId}/item/${edge.configKey}?teamId=${edge.teamId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${edge.accessToken}` },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error("Failed to fetch app config from Vercel Edge Config.", {
        cause: { status: response.status, text: response.statusText },
      });
    }

    if (response.status === 204) {
      return null;
    }

    const data = (await response.json()).value as AppConfigStore | undefined;

    return data ?? null;
  }

  return getSecret<AppConfigStore>(config.aws.secretManagerPath);
}

async function saveStore(store: AppConfigStore): Promise<void> {
  if (config.appConfig.provider === "edge") {
    const edge = config.appConfig.edge;

    assertEdgeConfig(edge);

    const response = await fetch(
      `${VERCEL_API_URL_BASE}/${edge.edgeConfigId}/items?teamId=${edge.teamId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${edge.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              operation: "upsert",
              key: edge.configKey,
              value: store,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update app config in Vercel Edge Config.", {
        cause: { status: response.status, text: response.statusText },
      });
    }

    return;
  }

  await putSecret(config.aws.secretManagerPath, store);
}

/**
 * Get app configuration for a specific Saleor domain
 */
export async function getAppConfig(
  saleorDomain: string,
): Promise<SaleorAppConfig | null> {
  const store = await loadStore();

  if (!store) {
    return null;
  }

  const entry = store[saleorDomain];

  if (!entry) {
    return null;
  }

  try {
    const parsed = saleorAppConfigSchema.safeParse(entry);

    return parsed.success ? parsed.data : null;
  } catch {
    // Zod v4 can throw "_zod" internal errors with certain data shapes
    // (e.g. from Secrets Manager). Fail gracefully.
    return null;
  }
}

/**
 * Store app configuration for a specific Saleor domain
 */
export async function setAppConfig(
  saleorDomain: string,
  appConfig: SaleorAppConfig,
): Promise<void> {
  const store = (await loadStore()) ?? {};

  store[saleorDomain] = appConfig;
  await saveStore(store);
}

/**
 * Delete app configuration for a specific Saleor domain
 */
export async function deleteAppConfig(saleorDomain: string): Promise<void> {
  const store = await loadStore();

  if (!store) {
    return;
  }

  delete store[saleorDomain];
  await saveStore(store);
}

/**
 * List all configured Saleor domains
 */
export async function listAppConfigs(): Promise<string[]> {
  const store = await loadStore();

  return store ? Object.keys(store) : [];
}
