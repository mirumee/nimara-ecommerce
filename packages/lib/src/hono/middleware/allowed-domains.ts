import { type MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

import { UnauthorizedDomainError } from "#root/hono/error/http";
import { isDomainAllowed, rejectedDomainMessage } from "#root/saleor/security";

/**
 * Runs before any storage lookup or signature check, so an unlisted caller
 * costs nothing.
 */
export const allowedDomainsMiddleware = ({
  allowedDomains,
}: {
  allowedDomains: string[];
}): MiddlewareHandler =>
  createMiddleware(async (context, next) => {
    const saleorDomain = context.req.header("saleor-domain");

    if (!isDomainAllowed({ domain: saleorDomain ?? "", allowedDomains })) {
      context
        .get("logger")
        .warning("Rejected a request from a non-allowlisted Saleor domain.", {
          path: context.req.path,
          saleorDomain,
        });

      throw new UnauthorizedDomainError({
        context: "headers > saleor-domain",
        message: rejectedDomainMessage({ allowedDomains, saleorDomain }),
      });
    }

    await next();
  });
