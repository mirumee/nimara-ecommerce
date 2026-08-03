import { CONFIG } from "@/config";
import { SaleorEdgeConfigProvider } from "@/lib/saleor/config/edge";

export const getConfigProvider = () =>
  SaleorEdgeConfigProvider({
    configKey: `${CONFIG.ENVIRONMENT}-${CONFIG.CONFIG_KEY}`,
    vercelTeamId: CONFIG.VERCEL_TEAM_ID,
    vercelEdgeDatabaseId: CONFIG.VERCEL_EDGE_CONFIG_ID,
    vercelAccessToken: CONFIG.VERCEL_ACCESS_TOKEN,
  });
