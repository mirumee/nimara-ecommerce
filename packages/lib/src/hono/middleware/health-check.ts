import { type MiddlewareHandler } from "hono";

export const healthCheckMiddleware = (opts?: {
  basePath?: string;
  path?: string;
}): MiddlewareHandler => {
  const { basePath, path } = { basePath: "", path: "/healthcheck", ...opts };

  return async (context, next) => {
    if (
      context.req.path === `${basePath}${path}` &&
      context.req.method === "GET"
    ) {
      return context.json({ status: "ok" });
    }

    await next();
  };
};
