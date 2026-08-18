import { createMiddleware } from "hono/factory";

import { type Logger } from "@nimara/infrastructure/logging/types";

export const loggingMiddleware = (logger: Logger) =>
  createMiddleware(async (context, next) => {
    context.set("logger", logger);

    const { method, path } = context.req;
    const metadata = { method, path };

    logger.debug("Incoming request.", metadata);

    await next();

    logger.debug("Outgoing response.", {
      ...metadata,
      status: context.res.status,
    });
  });
