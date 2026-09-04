import { Hono } from "hono";
import { z } from "zod";

import { saleorTokenHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { responseFromErrors } from "@nimara/lib/hono/api/util";
import { saleorTokenMiddleware } from "@nimara/lib/hono/middleware/saleor-token";
import { zodValidatorMiddleware } from "@nimara/lib/hono/middleware/zod-validator";
import {
  requireSaleorTenant,
  saleorTenantMiddleware,
} from "@nimara/lib/hono/saleor/tenant";

import { container } from "@/container";

import { settingsFormSchema } from "./schema";

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
    "/settings/fetch",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    async (context) => {
      const result = await container.get("getSettingsForm")(
        requireSaleorTenant(context),
      );

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json(result.data);
    },
  )
  .post(
    "/settings/save",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    zodValidatorMiddleware("json", z.object({ data: settingsFormSchema })),
    async (context) => {
      const result = await container.get("saveSettings")({
        ...requireSaleorTenant(context),
        data: context.req.valid("json").data,
      });

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json({ status: "ok" });
    },
  );
