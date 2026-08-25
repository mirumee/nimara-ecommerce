import { type Context as HonoContext, type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import { UnauthorizedError } from "#root/hono/error/http";
import { type SaleorTenant } from "#root/saleor/tenant";

/**
 * Only a middleware that verified a signature against the installation's JWKS
 * publishes this, so a route scopes by it and never by a caller-sent value.
 */
export const requireSaleorTenant = (context: HonoContext): SaleorTenant => {
  const saleorApiUrl = context.get("saleorApiUrl");
  const saleorDomain = context.get("saleorDomain");

  if (!saleorApiUrl || !saleorDomain) {
    throw new UnauthorizedError({
      message:
        "No verified Saleor tenant on the request. Mount a Saleor auth middleware in front of this route.",
    });
  }

  return { saleorApiUrl, saleorDomain };
};

/**
 * Hands the tenant to a handler as an argument, so a route cannot be written
 * that forgets to scope by it. Mount it behind the middleware that verifies.
 */
export const withSaleorTenant =
  <Context extends HonoContext>(
    handler: (
      context: Context,
      tenant: SaleorTenant,
    ) => Promise<Response> | Response,
  ) =>
  (context: Context) =>
    handler(context, requireSaleorTenant(context));

/**
 * Seatbelt for a tenant-scoped subtree; it verifies nothing itself, so mount
 * it behind the middleware that does. The manifest and register routes have no
 * tenant yet and must stay in front of it.
 */
export const saleorTenantMiddleware = (): MiddlewareHandler =>
  createMiddleware(async (context, next) => {
    requireSaleorTenant(context);

    await next();
  });
