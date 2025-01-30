import { CONFIG } from "@/config";
import { getRequestOrigin } from "@/lib/http/request";
import { type SaleorAppManifest } from "@/lib/saleor/types";

export async function GET(request: Request) {
  const host = getRequestOrigin(request);

  const manifest: SaleorAppManifest = {
    id: CONFIG.APP_ID,
    version: CONFIG.VERSION,
    name: CONFIG.APP_ID,
    permissions: [],
    tokenTargetUrl: `${host}/api/saleor/register`,
    webhooks: [],
  };

  return Response.json(manifest);
}
