import { Hono, type MiddlewareHandler } from "hono";

import { errorHandler } from "@/lib/error/handler";

/**
 * Builds a minimal Hono app for middleware/route tests, with the real error
 * handler and a stub logger in the context.
 */
export const createTestApp = ({
  middlewares = [],
  path = "/",
  app,
  logger,
}: {
  app: Hono;
  logger?: unknown;
  middlewares?: MiddlewareHandler[];
  path?: string;
}) => {
  const testApp = new Hono().onError(errorHandler);

  testApp.use(async (context, next) => {
    context.set(
      "logger",
      (logger ?? {
        debug: () => {},
        info: () => {},
        warning: () => {},
        error: () => {},
      }) as never,
    );

    await next();
  });

  middlewares.forEach((middleware) => testApp.use(middleware));

  testApp.route(path, app);

  return testApp;
};
