import { CONFIG } from "@/config";
import { SaleorEdgeConfigProvider } from "@/lib/saleor/config/edge";

// Ignore param - single tenant app.
export const getConfigProvider = ({}: { saleorDomain: string }) =>
  SaleorEdgeConfigProvider({
    configKey: CONFIG.CONFIG_KEY,
    saleorDomain: CONFIG.SALEOR_DOMAIN,
    vercelTeamId: CONFIG.VERCEL_TEAM_ID,
    vercelEdgeDatabaseId: CONFIG.VERCEL_EDGE_CONFIG_ID,
    vercelAccessToken: CONFIG.VERCEL_ACCESS_TOKEN,
  });
