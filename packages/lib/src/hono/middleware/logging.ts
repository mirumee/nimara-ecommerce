import { type Context } from "hono";
import { createMiddleware } from "hono/factory";

import { type Logger } from "@nimara/infrastructure/logging/types";

import { withLogContext } from "#root/logging/with-context";

const STATIC_PATH_RE =
  /\/(assets|public|static)\/|\.(ico|css|js|map|png|jpe?g|gif|svg|webp|woff2?|ttf)$/i;

export const loggingMiddleware = (
  logger: Logger,
  { skip = (context: Context) => STATIC_PATH_RE.test(context.req.path) } = {},
) =>
  createMiddleware(async (context, next) => {
    const requestId = context.get("requestId");
    const requestLogger = requestId
      ? withLogContext({ context: { requestId }, logger })
      : logger;

    context.set("logger", requestLogger);

    if (skip(context)) {
      return next();
    }

    const { method, path } = context.req;
    const metadata = { method, path };
    const start = performance.now();

    requestLogger.debug("Incoming request.", metadata);

    await next();

    requestLogger.debug("Outgoing response.", {
      ...metadata,
      duration: `${Math.round(performance.now() - start)}ms`,
      status: context.res.status,
    });
  });
