import { CONFIG } from "@/config";
import { type SaleorAppManifest } from "@/lib/saleor/types";

export async function GET(request: Request) {
  const manifest: SaleorAppManifest = {
    id: CONFIG.APP_ID,
    version: CONFIG.VERSION,
    name: CONFIG.APP_ID,
    permissions: [],
    tokenTargetUrl: "",
    webhooks: [],
  };

  console.log(process.env.npm);

  return Response.json(manifest);
}
