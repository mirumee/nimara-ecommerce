import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { requestId } from "hono/request-id";

import { errorHandler } from "@nimara/lib/hono/error/handler";
import { healthCheckMiddleware } from "@nimara/lib/hono/middleware/health-check";
import { loggingMiddleware } from "@nimara/lib/hono/middleware/logging";
import { requestOriginMiddleware } from "@nimara/lib/hono/middleware/request-origin";
import { initSentry } from "@nimara/lib/reporting/sentry/instrument";

import { container } from "@/container";

import { appRoutes } from "./api/rest/app";
import { saleorRoutes } from "./api/rest/saleor";
import { stripeRoutes } from "./api/rest/stripe";
import { dashboard } from "./dashboard";

const CONFIG = container.get("config");

initSentry({
  dsn: CONFIG.SENTRY_DSN,
  environment: CONFIG.ENVIRONMENT,
  release: CONFIG.RELEASE,
});

const app = new Hono()
  .onError(errorHandler)
  .basePath(CONFIG.BASE_PATH as "/")
  .use(requestId())
  .use(loggingMiddleware(container.get("logger")))
  .use(requestOriginMiddleware({ basePath: CONFIG.BASE_PATH }))
  .use(healthCheckMiddleware({ basePath: CONFIG.BASE_PATH }))
  .route("/", dashboard)
  /**
   * Nested routes must be defined at the end for proper type inference for
   * hono/client.
   */
  .route("/api/saleor", saleorRoutes)
  .route("/api/stripe", stripeRoutes)
  .route("/api/app", appRoutes);

export type AppType = typeof app;

/**
 * `app` — Vercel Hono preset / dev server
 * `handler` — AWS Lambda
 */
const handler = handle(app);

export { app, handler };
