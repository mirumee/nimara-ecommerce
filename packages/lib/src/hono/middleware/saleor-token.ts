import { type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import { saleorHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { type SaleorJwtClaims } from "@nimara/infrastructure/apps/saleor/types";
import {
  type JoseAuthService,
  type JwtClaims,
} from "@nimara/infrastructure/jose/auth/types";

import {
  ForbiddenError,
  UnauthorizedDomainError,
  UnauthorizedError,
} from "#root/hono/error/http";
import { isDomainAllowed, rejectedDomainMessage } from "#root/saleor/security";
import { saleorDomainFromApiUrl } from "#root/saleor/url";

const BEARER = /^Bearer\s+/i;

// Verification proves who signed the claims, not what shape they are.
const claimedPermissions = (claims: JwtClaims) => {
  const { permissions, user_permissions } = claims as SaleorJwtClaims;

  return new Set(permissions ?? user_permissions ?? []);
};

/**
 * The tenant comes from `saleor-api-url` and is proven against that Saleor's
 * JWKS, never from the body the caller writes.
 * Left empty, any token Saleor ever signed passes — a storefront customer's included.
 */
export const saleorTokenMiddleware = ({
  allowedDomains,
  joseAuthService,
  requiredPermissions,
}: {
  allowedDomains: string[];
  joseAuthService: (saleorDomain: string) => JoseAuthService;
  requiredPermissions: string[];
}): MiddlewareHandler =>
  createMiddleware(async (context, next) => {
    const logger = context.get("logger");
    const token = context.req.header("authorization")?.replace(BEARER, "");
    const saleorApiUrl = saleorHeaders.shape["saleor-api-url"].safeParse(
      context.req.header("saleor-api-url"),
    ).data;

    if (!token) {
      throw new UnauthorizedError({
        message: "Missing bearer token.",
        context: "headers > authorization",
      });
    }

    if (!saleorApiUrl) {
      throw new UnauthorizedError({
        message: "Missing or malformed Saleor API URL.",
        context: "headers > saleor-api-url",
      });
    }

    const saleorDomain = saleorDomainFromApiUrl(saleorApiUrl);

    if (!isDomainAllowed({ domain: saleorDomain, allowedDomains })) {
      logger.warning("Rejected a dashboard request for an untrusted Saleor.", {
        path: context.req.path,
        saleorDomain,
      });

      throw new UnauthorizedDomainError({
        message: rejectedDomainMessage({ allowedDomains, saleorDomain }),
        context: "headers > saleor-api-url",
      });
    }

    const verified = await joseAuthService(saleorDomain).verifyJwt(token);

    if (!verified.ok) {
      throw new UnauthorizedError({
        message: "Saleor token verification failed.",
        context: "headers > authorization",
        errors: verified.errors.map((error) => ({
          message: error.message ?? error.code,
          code: error.code,
        })),
      });
    }

    const granted = claimedPermissions(verified.data);
    const missing = requiredPermissions.filter(
      (permission) => !granted.has(permission),
    );

    if (missing.length) {
      logger.warning("Rejected a dashboard request lacking permissions.", {
        missing,
        saleorDomain,
      });

      throw new ForbiddenError({
        message: `Missing Saleor permissions: ${missing.join(", ")}.`,
        context: "headers > authorization",
      });
    }

    // Scope every downstream read and write to the tenant this request proved.
    context.set("saleorApiUrl", saleorApiUrl);
    context.set("saleorDomain", saleorDomain);

    await next();
  });
