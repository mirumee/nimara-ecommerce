import { isError } from "lodash";
import { z } from "zod";

import { CONFIG } from "@/config";
import { responseError } from "@/lib/api/util";
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
    return responseError({
      description: "Invalid saleor headers.",
      context: "headers",
      errors: headers.error.errors,
    });
  }

  const body = z
    .object({ auth_token: z.string() })
    .safeParse(await request.json());

  if (!body.success) {
    return responseError({
      description: "Invalid body.",
      context: "body",
      errors: body.error.errors,
    });
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
    const context = isError(err)
      ? {
          error: err.message,
          cause: err.cause,
        }
      : undefined;

    logger.error(`Failed to install for ${saleorDomain}.`, context);

    return responseError({
      description: "Failed to install the app.",
      context: "install",
      errors: context ? [{ message: context.error }] : [],
    });
  }

  logger.info(`Installation successful for ${saleorDomain}.`);

  return Response.json({ status: "ok" });
}
