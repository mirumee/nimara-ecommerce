import { createMiddleware } from "hono/factory";
import { z } from "zod";

import { isDomainAllowed } from "@nimara/infrastructure/apps/saleor/validation";

import { UnauthorizedDomainError } from "@/lib/error/http";

const tenantSchema = z.object({ saleorDomain: z.string() });

/**
 * Refuses a request naming a Saleor this deployment does not serve. The JWT
 * check that follows only proves the caller signs for the domain it claims,
 * so without this a stranger's own Saleor passes it.
 */
export const saleorDomainAllowlistMiddleware = ({
  allowedDomains,
}: {
  allowedDomains: string[];
}) =>
  createMiddleware(async (context, next) => {
    const logger = context.get("logger");
    // A body that is absent or not JSON names no tenant, so it is refused too.
    const body = await context.req.json().catch(() => null);
    const saleorDomain = tenantSchema.safeParse(body).data?.saleorDomain;

    if (
      !saleorDomain ||
      !isDomainAllowed({ domain: saleorDomain, allowedDomains })
    ) {
      logger.warning("Rejected a dashboard request for an untrusted Saleor.", {
        path: context.req.path,
        saleorDomain,
      });

      throw new UnauthorizedDomainError({
        message: allowedDomains.length
          ? `${saleorDomain ?? "The request"} is not an allowed Saleor domain.`
          : "No Saleor domain is allowed. Set ALLOWED_DOMAINS to the domains this deployment serves.",
        context: "body > saleorDomain",
      });
    }

    await next();
  });
