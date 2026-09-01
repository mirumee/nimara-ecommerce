import { Hono } from "hono";

import { saleorTokenHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { responseFromErrors } from "@nimara/lib/hono/api/util";
import { saleorTokenMiddleware } from "@nimara/lib/hono/middleware/saleor-token";
import { zodValidatorMiddleware } from "@nimara/lib/hono/middleware/zod-validator";
import {
  requireSaleorTenant,
  saleorTenantMiddleware,
} from "@nimara/lib/hono/saleor/tenant";

import { container } from "@/services/handler/container";
import { getConfigFormDataUseCase } from "@/use-cases/get-config-form-data-use-case";
import { saveConfigUseCase } from "@/use-cases/save-config-use-case";

import { configFormSchema } from "./schema";

const { appConfigService, config, joseAuthService } = container.items;

const getConfigForm = getConfigFormDataUseCase({ appConfigService });
const saveConfig = saveConfigUseCase({ appConfigService });

export const appRoutes = new Hono()
  .use(
    saleorTokenMiddleware({
      allowedDomains: config.ALLOWED_DOMAINS,
      joseAuthService,
      requiredPermissions: ["MANAGE_APPS"],
    }),
  )
  .use(saleorTenantMiddleware())
  .post(
    "/config/fetch",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    async (context) => {
      const result = await getConfigForm(requireSaleorTenant(context));

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json(result.data);
    },
  )
  .post(
    "/config/save",
    zodValidatorMiddleware("header", saleorTokenHeaders),
    zodValidatorMiddleware("json", configFormSchema),
    async (context) => {
      const result = await saveConfig({
        ...requireSaleorTenant(context),
        data: context.req.valid("json"),
      });

      if (!result.ok) {
        return responseFromErrors(result.errors);
      }

      return context.json({ status: "ok" });
    },
  );
