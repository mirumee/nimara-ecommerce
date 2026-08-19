import { type MiddlewareHandler } from "hono";

import { type AsyncResult } from "@nimara/domain/objects/Result";
import {
  type SaleorWebhookHeaders,
  saleorWebhookHeaders,
  webhookPayloadSchema,
} from "@nimara/infrastructure/apps/saleor/schemas";
import { isDomainAllowed } from "@nimara/infrastructure/apps/saleor/validation";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { UnauthorizedError } from "@/lib/error/http";
import { zodValidatorMiddleware } from "@/lib/middleware/zod-validator-middleware";

export const saleorWebhookValidationMiddleware = ({
  allowedDomains,
  getInstallation,
  joseAuthService,
}: {
  allowedDomains: string[];
  getInstallation: (
    saleorDomain: string,
  ) => AsyncResult<{ saleorDomain: string } | null>;
  joseAuthService: (saleorDomain: string) => JoseAuthService;
}): MiddlewareHandler[] => [
  zodValidatorMiddleware("header", saleorWebhookHeaders),
  // Makes `req.valid("json")` available to handlers (typed via HandlerContext).
  zodValidatorMiddleware("json", webhookPayloadSchema),
  async (context, next) => {
    const { req } = context;
    const logger = context.get("logger");
    // @ts-expect-error https://github.com/honojs/hono/issues/3202
    const header = req.valid("header") as SaleorWebhookHeaders;
    const saleorDomain = header["saleor-domain"];

    logger.info(`Received Saleor '${header["saleor-event"]}' webhook.`, {
      path: req.path,
    });

    if (!isDomainAllowed({ domain: saleorDomain, allowedDomains })) {
      logger.warning("Rejected webhook from a non-allowlisted domain.", {
        saleorDomain,
      });

      throw new UnauthorizedError({
        message: "Untrusted Saleor issuer.",
        context: "headers > saleor-domain",
      });
    }

    const installation = await getInstallation(saleorDomain);

    if (!installation.ok || !installation.data) {
      throw new UnauthorizedError({
        message: "The app is not installed for this Saleor instance.",
        context: "headers > saleor-domain",
      });
    }

    const payload = await req.raw.clone().text();
    const result = await joseAuthService(saleorDomain).verifyDetachedJws({
      jws: header["saleor-signature"],
      payload,
    });

    if (!result.ok) {
      throw new UnauthorizedError({
        message: "Saleor webhook verification failed.",
        context: "headers > saleor-signature",
        errors: result.errors.map((error) => ({
          message: error.message ?? error.code,
          code: error.code,
        })),
      });
    }

    await next();
  },
];
