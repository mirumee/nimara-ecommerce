import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { requestId } from "hono/request-id";

import { errorHandler } from "@nimara/lib/hono/error/handler";
import { healthCheckMiddleware } from "@nimara/lib/hono/middleware/health-check";
import { loggingMiddleware } from "@nimara/lib/hono/middleware/logging";
import { requestOriginMiddleware } from "@nimara/lib/hono/middleware/request-origin";
import { initSentry } from "@nimara/lib/reporting/sentry/instrument";

import { container } from "@/services/handler/container";
import logo from "@/services/handler/logo.png?inline";

import { appRoutes } from "./api/rest/app";
import { saleorRoutes } from "./api/rest/saleor";
import { dashboard } from "./dashboard";

const { config, logger } = container.items;
const LOGO = Buffer.from(logo.split(",")[1] ?? "", "base64");

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.ENVIRONMENT,
  release: config.RELEASE,
});

const app = new Hono()
  .onError(errorHandler)
  .basePath(config.BASE_PATH as "/")
  .use(requestId())
  .use(loggingMiddleware(logger))
  .use(requestOriginMiddleware({ basePath: config.BASE_PATH }))
  .use(healthCheckMiddleware({ basePath: config.BASE_PATH }))
  .route("/", dashboard)
  .get("/logo.png", (context) =>
    context.body(LOGO, 200, { "content-type": "image/png" }),
  )
  /**
   * Saleor opens `appUrl`, which is the app's root. A dashboard, where the app
   * has one, is mounted above and answers first.
   */
  .get("/", (context) =>
    context.text(`${config.DISPLAY_NAME} ${config.VERSION}.`),
  )
  /**
   * Nested routes must be defined at the end for proper type inference for
   * hono/client.
   */
  .route("/api/saleor", saleorRoutes)
  .route("/api/app", appRoutes);

export type AppType = typeof app;

// `app` for the Vercel preset and the dev server, `handler` for AWS Lambda.
const handler = handle(app);

export { app, handler };
