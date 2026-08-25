import { Hono } from "hono";
import { z } from "zod";

import { saleorTokenHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { getAppBaseUrl, responseFromErrors } from "@nimara/lib/hono/api/util";
import { saleorTokenMiddleware } from "@nimara/lib/hono/middleware/saleor-token";
import { zodValidatorMiddleware } from "@nimara/lib/hono/middleware/zod-validator";
import {
  requireSaleorTenant,
  saleorTenantMiddleware,
} from "@nimara/lib/hono/saleor/tenant";

import { container } from "@/container";

import { configFormSchema } from "./schema";

const CONFIG = container.get("config");

export const appRoutes = new Hono()
  .use(
    saleorTokenMiddleware({
      allowedDomains: CONFIG.ALLOWED_DOMAINS,
      joseAuthService: container.get("joseAuthService"),
      requiredPermissions: ["MANAGE_APPS"],
    }),
  )
  .use(saleorTenantMiddleware())
  .post(
    "/config/fetch",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    async (context) => {
      const result = await container.get("getConfigFormData")(
        requireSaleorTenant(context),
      );

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json(result.data);
    },
  )
  .post(
    "/config/save",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    zodValidatorMiddleware("json", z.object({ data: configFormSchema })),
    async (context) => {
      const result = await container.get("saveConfig")({
        ...requireSaleorTenant(context),
        appUrl: getAppBaseUrl(context.req),
        data: context.req.valid("json").data,
      });

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json({ status: "ok" });
    },
  );
