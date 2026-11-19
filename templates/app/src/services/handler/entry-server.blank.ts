import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { requestId } from "hono/request-id";

import { errorHandler } from "@nimara/lib/hono/error/handler";
import { healthCheckMiddleware } from "@nimara/lib/hono/middleware/health-check";
import { loggingMiddleware } from "@nimara/lib/hono/middleware/logging";
import { requestOriginMiddleware } from "@nimara/lib/hono/middleware/request-origin";
import { initSentry } from "@nimara/lib/reporting/sentry/instrument";

import { container } from "@/services/handler/container";

const { config, logger } = container.items;

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
  .get("/", (context) =>
    context.text(`${config.DISPLAY_NAME} ${config.VERSION}.`),
  );

export type AppType = typeof app;

// `app` for the Vercel preset and the dev server, `handler` for AWS Lambda.
const handler = handle(app);

export { app, handler };
