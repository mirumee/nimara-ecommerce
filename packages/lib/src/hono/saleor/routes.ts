import { Hono, type MiddlewareHandler } from "hono";
import { z } from "zod";

import { type SaleorAppManifest } from "@nimara/domain/objects/SaleorApp";
import { saleorHeaders } from "@nimara/infrastructure/apps/saleor/schemas";
import { type InstallSaleorAppUseCase } from "@nimara/infrastructure/apps/saleor/types";

import { getAppBaseUrl, responseFromErrors } from "#root/hono/api/util";
import { allowedDomainsMiddleware } from "#root/hono/middleware/allowed-domains";
import { zodValidatorMiddleware } from "#root/hono/middleware/zod-validator";
import { type HandlerContext } from "#root/hono/saleor/types";
import { createWebhookRoutes } from "#root/hono/saleor/webhooks";
import { saleorUrlFromDomain } from "#root/saleor/url";
import { type SaleorWebhook, webhooksManifest } from "#root/saleor/webhooks";

type ManifestInput = Omit<
  SaleorAppManifest,
  "appUrl" | "brand" | "tokenTargetUrl" | "webhooks"
> & {
  // Where the Dashboard opens the app; omit for an app that ships no UI.
  appPath?: string;
  logoPath?: string;
};

/**
 * The Saleor side of an app: manifest, register endpoint, webhooks.
 * `mountPath` is where they are routed and what the manifest URLs are built
 * from.
 */
export const createSaleorRoutes = ({
  allowedDomains,
  installApp,
  manifest,
  mountPath = "/api/saleor",
  webhookMiddlewares,
  webhooks = [],
}: {
  allowedDomains: string[];
  installApp: InstallSaleorAppUseCase;
  manifest: ManifestInput;
  mountPath?: string;
  /**
   * Empty only for an app with no webhooks: handlers trust the payload, so a
   * missing signature check leaves them open to anyone.
   */
  webhookMiddlewares: MiddlewareHandler[];
  webhooks?: readonly SaleorWebhook<HandlerContext<any>>[];
}) => {
  const allowlist = allowedDomainsMiddleware({ allowedDomains });

  return new Hono()
    .get("/manifest", (context) => {
      const { appPath, logoPath, ...rest } = manifest;
      const appBaseUrl = getAppBaseUrl(context.req);

      return context.json({
        ...rest,
        ...(appPath && { appUrl: `${appBaseUrl}${appPath}` }),
        ...(logoPath && {
          brand: { logo: { default: `${appBaseUrl}${logoPath}` } },
        }),
        tokenTargetUrl: `${appBaseUrl}${mountPath}/register`,
        webhooks: webhooksManifest({
          targetBaseUrl: `${appBaseUrl}${mountPath}/webhooks`,
          webhooks,
        }),
      } satisfies SaleorAppManifest);
    })
    .post(
      "/register",
      zodValidatorMiddleware("header", saleorHeaders),
      zodValidatorMiddleware("json", z.object({ auth_token: z.string() })),
      allowlist,
      async (context) => {
        const logger = context.get("logger");
        const saleorDomain = context.req.valid("header")["saleor-domain"];

        logger.info(`Installing app for ${saleorDomain}.`);

        const result = await installApp({
          authToken: context.req.valid("json").auth_token,
          saleorDomain,
          saleorUrl: saleorUrlFromDomain(saleorDomain),
        });

        if (!result.ok) {
          logger.error(`Failed to install for ${saleorDomain}.`, {
            errors: result.errors,
          });

          return responseFromErrors(result.errors);
        }

        logger.info(`Installation successful for ${saleorDomain}.`);

        return context.json({ status: "ok" });
      },
    )
    .route(
      "/webhooks",
      createWebhookRoutes({
        middlewares: [allowlist, ...webhookMiddlewares],
        webhooks,
      }),
    );
};
