import { type MiddlewareHandler } from "hono";

import { type AsyncResult } from "@nimara/domain/objects/Result";
import {
  type SaleorWebhookHeaders,
  saleorWebhookHeaders,
  webhookPayloadSchema,
} from "@nimara/infrastructure/apps/saleor/schemas";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { UnauthorizedError } from "#root/hono/error/http";
import { zodValidatorMiddleware } from "#root/hono/middleware/zod-validator";

export const saleorWebhookValidationMiddleware = ({
  getInstallation,
  joseAuthService,
}: {
  getInstallation: (
    saleorDomain: string,
  ) => AsyncResult<{ saleorDomain: string } | null>;
  joseAuthService: (saleorDomain: string) => JoseAuthService;
}): MiddlewareHandler[] => [
  zodValidatorMiddleware("header", saleorWebhookHeaders),
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

    const installation = await getInstallation(saleorDomain);

    if (!installation.ok || !installation.data) {
      throw new UnauthorizedError({
        message: "The app is not installed for this Saleor instance.",
        context: "headers > saleor-domain",
      });
    }

    const payload = await req.text();
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

    // Scope every downstream read and write to the tenant that signed this.
    context.set("saleorApiUrl", header["saleor-api-url"]);
    context.set("saleorDomain", saleorDomain);

    await next();
  },
];
