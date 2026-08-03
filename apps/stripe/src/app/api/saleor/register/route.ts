import { z } from "zod";

import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { installApp } from "@/lib/saleor/app/install";
import { assertDomainAllowed } from "@/lib/saleor/config/context";
import { SaleorDomainNotAllowedError } from "@/lib/saleor/error";
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
      errors: headers.error.issues.map((issue) => ({
        message: issue.message,
      })),
    });
  }

  const body = z
    .object({ auth_token: z.string() })
    .safeParse(await request.json());

  if (!body.success) {
    return responseError({
      description: "Invalid body.",
      context: "body",
      errors: body.error.issues.map((issue) => ({ message: issue.message })),
    });
  }
  const saleorAuthToken = body.data.auth_token;
  const saleorDomain = headers.data["saleor-domain"];

  const logger = getLoggingProvider();

  try {
    assertDomainAllowed(saleorDomain);
  } catch (err) {
    logger.warning(`Rejected installation for ${saleorDomain}.`);

    return responseError({
      description: "Saleor domain is not allowed to install this app.",
      context: "domain",
      errors: isError(err, SaleorDomainNotAllowedError)
        ? [{ message: err.message }]
        : [],
      status: 403,
    });
  }

  const jwksProvider = getJWKSProvider({ saleorDomain });
  const saleorClient = getSaleorClient({
    saleorDomain,
    authToken: saleorAuthToken,
    logger,
  });
  const configProvider = getConfigProvider();

  logger.info(`Installing app for ${saleorDomain}.`);

  try {
    await installApp({
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
