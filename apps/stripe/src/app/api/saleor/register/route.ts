import { z } from "zod";

import { CONFIG } from "@/config";
import { installApp } from "@/lib/saleor/app/install";
import { saleorHeaders } from "@/lib/saleor/headers";
import { getConfigProvider } from "@/providers/config";
import { getJWKSProvider } from "@/providers/jwks";
import { getLoggingProvider } from "@/providers/logging";
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

  const logger = getLoggingProvider();
  const jwksProvider = getJWKSProvider();
  const saleorClient = getSaleorClient({
    saleorDomain,
    authToken: saleorAuthToken,
    logger,
  });
  const configProvider = getConfigProvider({ saleorDomain });

  logger.info(`Installing app for ${saleorDomain}.`);

  try {
    await installApp({
      saleorUrl: CONFIG.SALEOR_URL,
      jwksProvider,
      saleorClient,
      saleorDomain,
      saleorAuthToken,
      configProvider,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error(err);

      logger.error(`Failed to install for ${saleorDomain}.`, {
        error: err.message,
        cause: err.cause,
      });

      return Response.json(
        {
          context: "install",
          errors: [{ message: err?.message }],
        },
        { status: 500 },
      );
    }

    return Response.json(
      {
        context: "install",
        errors: [{ message: "Failed to install app." }],
      },
      { status: 500 },
    );
  }

  logger.info(`Installation successful for ${saleorDomain}.`);

  return Response.json({ status: "ok" });
}
