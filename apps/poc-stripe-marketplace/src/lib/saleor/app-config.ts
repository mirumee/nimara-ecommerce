import { z } from "zod";

import { CONFIG } from "@/config";
import { getSecret, putSecret } from "@/lib/aws/secrets-manager";

export const saleorAppConfigSchema = z.object({
  authToken: z.string(),
  registeredAt: z.string(),
  saleorAppId: z.string(),
  saleorDomain: z.string(),
});

export type SaleorAppConfig = z.infer<typeof saleorAppConfigSchema>;

type AppConfigStore = Record<string, SaleorAppConfig>;

export async function getAppConfig(
  saleorDomain: string,
): Promise<SaleorAppConfig | null> {
  const store = await getSecret<AppConfigStore>(CONFIG.SECRET_MANAGER_APP_CONFIG_PATH);

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

export async function setAppConfig(
  saleorDomain: string,
  config: SaleorAppConfig,
): Promise<void> {
  const store =
    (await getSecret<AppConfigStore>(CONFIG.SECRET_MANAGER_APP_CONFIG_PATH)) || {};

  store[saleorDomain] = config;

  await putSecret(CONFIG.SECRET_MANAGER_APP_CONFIG_PATH, store);
}
