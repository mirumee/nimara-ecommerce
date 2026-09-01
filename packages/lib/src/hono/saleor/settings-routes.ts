import { Hono } from "hono";
import { type z } from "zod";

import { type AsyncResult } from "@nimara/domain/objects/Result";
import { saleorTokenHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";
import {
  type SettingsFormData,
  type SettingsFormInput,
} from "@nimara/infrastructure/use-cases/apps/saleor/settings-form";

import { responseFromErrors } from "#root/hono/api/util";
import { saleorTokenMiddleware } from "#root/hono/middleware/saleor-token";
import { zodValidatorMiddleware } from "#root/hono/middleware/zod-validator";
import {
  requireSaleorTenant,
  saleorTenantMiddleware,
} from "#root/hono/saleor/tenant";

/**
 * What a dashboard calls to read and write its Saleor's settings. The tenant
 * comes from the verified token, so a body naming another one changes nothing.
 *
 * Every field is optional on the way in: a blank secret keeps the stored one.
 */
export const createAppSettingsRoutes = <
  Settings extends Record<string, string>,
>({
  allowedDomains,
  allowUnverifiedToken,
  getSettingsForm,
  joseAuthService,
  saveSettings,
  settingsSchema,
}: {
  /** See `saleorTokenMiddleware`. Off unless the caller opts in. */
  allowUnverifiedToken?: boolean;
  allowedDomains: string[];
  getSettingsForm: (opts: {
    saleorDomain: string;
  }) => AsyncResult<SettingsFormData<Settings>>;
  joseAuthService: (saleorDomain: string) => JoseAuthService;
  saveSettings: (opts: {
    data: SettingsFormInput<Settings>;
    saleorDomain: string;
  }) => AsyncResult<void>;
  settingsSchema: z.ZodObject<Record<keyof Settings & string, z.ZodType>>;
}) =>
  new Hono()
    .use(
      saleorTokenMiddleware({
        allowedDomains,
        allowUnverifiedToken,
        joseAuthService,
        requiredPermissions: ["MANAGE_APPS"],
      }),
    )
    .use(saleorTenantMiddleware())
    .post(
      "/settings/fetch",
      zodValidatorMiddleware("header", saleorTokenHeaders),
      async (context) => {
        const result = await getSettingsForm(requireSaleorTenant(context));

        if (!result.ok) {
          return responseFromErrors(result.errors);
        }

        return context.json(result.data);
      },
    )
    .post(
      "/settings/save",
      zodValidatorMiddleware("header", saleorTokenHeaders),
      zodValidatorMiddleware(
        "json",
        settingsSchema.partial() as z.ZodType<SettingsFormInput<Settings>>,
      ),
      async (context) => {
        const result = await saveSettings({
          ...requireSaleorTenant(context),
          data: context.req.valid("json"),
        });

        if (!result.ok) {
          return responseFromErrors(result.errors);
        }

        return context.json({ status: "ok" });
      },
    );
