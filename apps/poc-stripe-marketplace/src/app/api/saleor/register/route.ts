import { z } from "zod";

import { CONFIG } from "@/config";
import { responseError } from "@/lib/api/response-error";
import { fetchSaleorAppId } from "@/lib/saleor/client";
import { saleorHeaders } from "@/lib/saleor/headers";
import { setAppConfig } from "@/lib/saleor/app-config";

const registerBody = z.object({ auth_token: z.string() });

export async function POST(request: Request) {
  const headersParsed = saleorHeaders.safeParse(
    Object.fromEntries(request.headers.entries()),
  );

  if (!headersParsed.success) {
    return responseError({
      error: "Invalid headers",
      details: headersParsed.error.flatten(),
      status: 400,
    });
  }

  const bodyParsed = registerBody.safeParse(await request.json());

  if (!bodyParsed.success) {
    return responseError({
      error: "Invalid body",
      details: bodyParsed.error.flatten(),
      status: 400,
    });
  }

  const saleorDomain = headersParsed.data["saleor-domain"];
  const saleorApiUrl = headersParsed.data["saleor-api-url"];

  if (saleorDomain !== CONFIG.SALEOR_DOMAIN) {
    return responseError({
      error: `Domain ${saleorDomain} is not allowed`,
      status: 403,
    });
  }

  if (new URL(saleorApiUrl).host !== CONFIG.SALEOR_DOMAIN) {
    return responseError({
      error: "saleor-api-url does not match configured domain",
      status: 403,
    });
  }

  const authToken = bodyParsed.data.auth_token;

  try {
    const saleorAppId = await fetchSaleorAppId({ saleorApiUrl, authToken });

    if (!saleorAppId) {
      return responseError({
        error: "Failed to fetch Saleor app ID",
        status: 500,
      });
    }

    await setAppConfig(saleorDomain, {
      authToken,
      saleorAppId,
      saleorDomain,
      registeredAt: new Date().toISOString(),
    });

    return Response.json({ status: "ok" });
  } catch (error) {
    return responseError({
      error: "Registration failed",
      details: error instanceof Error ? { message: error.message } : undefined,
      status: 500,
    });
  }
}
