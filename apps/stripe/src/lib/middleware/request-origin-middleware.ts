import { createMiddleware } from "hono/factory";

/**
 * Resolves the public origin of the request (respecting proxy headers) and
 * exposes it as `context.req.origin`.
 */
export const requestOriginMiddleware = () =>
  createMiddleware(async (context, next) => {
    const protocol =
      context.req.header("x-forwarded-proto") ??
      new URL(context.req.url).protocol.replace(":", "");
    const host =
      context.req.header("x-forwarded-host") ??
      context.req.header("host") ??
      new URL(context.req.url).host;

    context.req.origin = `${protocol}://${host}`;

    await next();
  });
