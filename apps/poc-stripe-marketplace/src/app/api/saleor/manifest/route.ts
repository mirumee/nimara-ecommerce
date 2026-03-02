import { CONFIG } from "@/config";
import { getRequestOrigin } from "@/lib/http/request";
import { type SaleorAppManifest } from "@/lib/saleor/types";

export async function GET(request: Request) {
  const origin = getRequestOrigin(request);

  const manifest: SaleorAppManifest = {
    id: CONFIG.APP_ID,
    version: CONFIG.VERSION,
    name: CONFIG.NAME,
    permissions: ["HANDLE_CHECKOUTS", "MANAGE_ORDERS", "HANDLE_PAYMENTS"],
    tokenTargetUrl: `${origin}/api/saleor/register`,
    appUrl: `${origin}/app`,
    webhooks: [],
  };

  return Response.json(manifest);
}
