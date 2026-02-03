import { z } from "zod";

import { getSecret, putSecret } from "@/lib/aws/secrets-manager";

/**
 * Saleor App Configuration Schema
 */
export const saleorAppConfigSchema = z.object({
  authToken: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
  config: z.record(z.unknown()).optional(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfigSchema>;

/**
 * Store structure in Secrets Manager
 * Maps Saleor domains to their configurations
 */
type AppConfigStore = Record<string, SaleorAppConfig>;

const SECRET_PATH =
  process.env.SECRET_MANAGER_APP_CONFIG_PATH || "/marketplace/app-config";

/**
 * Get app configuration for a specific Saleor domain
 */
export async function getAppConfig(
  saleorDomain: string,
): Promise<SaleorAppConfig | null> {
  const store = await getSecret<AppConfigStore>(SECRET_PATH);

  if (!store) {
    return null;
  }

  const config = store[saleorDomain];

  if (!config) {
    return null;
  }

  const parsed = saleorAppConfigSchema.safeParse(config);

  
return parsed.success ? parsed.data : null;
}

/**
 * Store app configuration for a specific Saleor domain
 */
export async function setAppConfig(
  saleorDomain: string,
  config: SaleorAppConfig,
): Promise<void> {
  const store = (await getSecret<AppConfigStore>(SECRET_PATH)) || {};

  store[saleorDomain] = config;
  await putSecret(SECRET_PATH, store);
}

/**
 * Delete app configuration for a specific Saleor domain
 */
export async function deleteAppConfig(saleorDomain: string): Promise<void> {
  const store = await getSecret<AppConfigStore>(SECRET_PATH);

  if (!store) {
    return;
  }

  delete store[saleorDomain];
  await putSecret(SECRET_PATH, store);
}

/**
 * List all configured Saleor domains
 */
export async function listAppConfigs(): Promise<string[]> {
  const store = await getSecret<AppConfigStore>(SECRET_PATH);

  
return store ? Object.keys(store) : [];
}
