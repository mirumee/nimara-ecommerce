import { CONFIG } from "@/config";
import { SaleorEdgeConfigProvider } from "@/lib/saleor/config/edge";
import { SaleorFileConfigProvider } from "@/lib/saleor/config/file";
import { type SaleorAppConfigProvider } from "@/lib/saleor/config/types";
import { invariant } from "@/lib/util";

export const getConfigProvider = (): SaleorAppConfigProvider => {
  if (CONFIG.CONFIG_PROVIDER === "file") {
    return SaleorFileConfigProvider({ filePath: CONFIG.CONFIG_FILE_PATH });
  }

  const {
    VERCEL_TEAM_ID: vercelTeamId,
    VERCEL_EDGE_CONFIG_ID: vercelEdgeDatabaseId,
    VERCEL_ACCESS_TOKEN: vercelAccessToken,
  } = CONFIG;

  invariant(
    vercelTeamId && vercelEdgeDatabaseId && vercelAccessToken,
    "Edge config provider requires VERCEL_TEAM_ID, VERCEL_EDGE_CONFIG_ID and VERCEL_ACCESS_TOKEN.",
  );

  return SaleorEdgeConfigProvider({
    configKey: `${CONFIG.ENVIRONMENT}-${CONFIG.CONFIG_KEY}`,
    vercelTeamId,
    vercelEdgeDatabaseId,
    vercelAccessToken,
  });
};
