import { z } from "zod";

import { CONFIG } from "@/config";
import { getRequestOrigin } from "@/lib/http/request";
import { installApp } from "@/lib/saleor/app/install";
import { saleorHeaders } from "@/lib/saleor/headers";
import { type SaleorAppManifest } from "@/lib/saleor/types";
import { getJWKSProvider } from "@/providers/jwks";
import { getSaleorClient } from "@/providers/saleor";

export async function POST(request: Request) {
  const headers = saleorHeaders.safeParse(
    Object.fromEntries(request.headers.entries()),
  );

  if (!headers.success) {
    return Response.json(
      {
        context: "headers",
        errors: headers.error.errors,
      },
      { status: 400 },
    );
  }

  const body = z
    .object({ auth_token: z.string() })
    .safeParse(await request.json());

  if (!body.success) {
    return Response.json(
      {
        context: "body",
        errors: body.error.errors,
      },
      { status: 400 },
    );
  }

  const saleorAuthToken = body.data.auth_token;
  const saleorDomain = headers.data["saleor-domain"];
  const jwksProvider = getJWKSProvider();
  const saleorClient = getSaleorClient({ authToken: saleorAuthToken });

  await installApp({
    saleorUrl: CONFIG.SALEOR_URL,
    jwksProvider,
    saleorClient,
    saleorDomain,
    saleorAuthToken,
    configProvider,
  });

  return Response.json({ status: "ok" });
}
