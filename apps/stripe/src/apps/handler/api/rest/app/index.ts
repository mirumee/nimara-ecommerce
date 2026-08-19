import { Hono } from "hono";
import { z } from "zod";

import { saleorBearerHeader } from "@nimara/infrastructure/apps/saleor/schemas";

import { container } from "@/container";
import { getAppBaseUrl, responseFromErrors } from "@/lib/api/util";
import { saleorDomainAllowlistMiddleware } from "@/lib/middleware/saleor-domain-allowlist-middleware";
import { zodValidatorMiddleware } from "@/lib/middleware/zod-validator-middleware";

import { configFormSchema } from "./schema";

/**
 * API consumed by the app's own config UI (dashboard iframe). Authenticated
 * with the Saleor dashboard JWT passed as a Bearer token.
 */
export const appRoutes = new Hono()
  .use(
    saleorDomainAllowlistMiddleware({
      allowedDomains: container.get("config").ALLOWED_DOMAINS,
    }),
  )
  .post(
    "/config/fetch",
    zodValidatorMiddleware("header", saleorBearerHeader),
    zodValidatorMiddleware("json", z.object({ saleorDomain: z.string() })),
    async (context) => {
      const result = await container.get("getConfigFormData")({
        accessToken: context.req.valid("header").authorization,
        saleorDomain: context.req.valid("json").saleorDomain,
      });

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json(result.data);
    },
  )
  .post(
    "/config/save",
    zodValidatorMiddleware("header", saleorBearerHeader),
    zodValidatorMiddleware(
      "json",
      z.object({ saleorDomain: z.string(), data: configFormSchema }),
    ),
    async (context) => {
      const { saleorDomain, data } = context.req.valid("json");

      const result = await container.get("saveConfig")({
        accessToken: context.req.valid("header").authorization,
        appUrl: getAppBaseUrl(context.req),
        data,
        saleorDomain,
      });

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json({ status: "ok" });
    },
  );
