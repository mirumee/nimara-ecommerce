import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { requestId } from "hono/request-id";

import { container } from "@/container";
import { errorHandler } from "@/lib/error/handler";
import { healthCheckMiddleware } from "@/lib/middleware/health-check-middleware";
import { loggingMiddleware } from "@/lib/middleware/logging-middleware";
import { nodeAssetsMiddleware } from "@/lib/middleware/node-assets-middleware";
import { requestOriginMiddleware } from "@/lib/middleware/request-origin-middleware";
import { vercelAssetsMiddleware } from "@/lib/middleware/vercel-assets-middleware";
import { initSentry } from "@/lib/sentry/instrument";

import { appRoutes } from "./api/rest/app";
import { saleorRoutes } from "./api/rest/saleor";
import { stripeRoutes } from "./api/rest/stripe";
import { clientEntryPoint } from "./client-entry-point";

const CONFIG = container.get("config");

initSentry({
  dsn: CONFIG.SENTRY_DSN,
  environment: CONFIG.ENVIRONMENT,
  release: CONFIG.RELEASE,
});

const assetsMiddleware =
  __BUILD_TARGET__ === "vercel"
    ? vercelAssetsMiddleware({
        assets: __CLIENT_ASSETS__,
        basePath: CONFIG.BASE_PATH,
      })
    : nodeAssetsMiddleware({
        basePath: CONFIG.BASE_PATH,
        dir: join(dirname(fileURLToPath(import.meta.url)), "assets"),
      });

const app = new Hono()
  .onError(errorHandler)
  .basePath(CONFIG.BASE_PATH as "/")
  .use(requestId())
  .use(loggingMiddleware(container.get("logger")))
  .use(requestOriginMiddleware())
  .use((context, next) => {
    context.req.basePath = CONFIG.BASE_PATH;

    return next();
  })
  .use(healthCheckMiddleware({ basePath: CONFIG.BASE_PATH }))
  .use(assetsMiddleware)
  /**
   * Nested routes must be defined at the end for proper type inference for
   * hono/client.
   */
  .route("/api/saleor", saleorRoutes)
  .route("/api/stripe", stripeRoutes)
  .route("/api/app", appRoutes);

export type AppType = typeof app;

// Serves the config UI. Remove this line for an app that ships no client.
app.get("/app", (context) => clientEntryPoint({ context }));

/**
 * `app` — Vercel Hono preset / dev server
 * `handler` — AWS Lambda
 */
const handler = handle(app);

export { app, handler };
