import { CONFIG } from "@/config";
import { SaleorEdgeConfigProvider } from "@/lib/saleor/config/edge";

export const getConfigProvider = ({ saleorDomain }: { saleorDomain: string }) =>
  SaleorEdgeConfigProvider({
    configKey: `${CONFIG.ENVIRONMENT}-${CONFIG.CONFIG_KEY}`,
    saleorDomain,
    vercelTeamId: CONFIG.VERCEL_TEAM_ID,
    vercelEdgeDatabaseId: CONFIG.VERCEL_EDGE_CONFIG_ID,
    vercelAccessToken: CONFIG.VERCEL_ACCESS_TOKEN,
  });
