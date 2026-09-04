import { createMiddleware } from "hono/factory";

/**
 * Public origin, proxy headers respected, published with the app's mount
 * prefix. `getAppBaseUrl` needs both: an origin without the prefix yields URLs
 * that 404 behind one.
 */
export const requestOriginMiddleware = ({ basePath = "" } = {}) =>
  createMiddleware(async (context, next) => {
    const protocol =
      context.req.header("x-forwarded-proto") ??
      new URL(context.req.url).protocol.replace(":", "");
    const host =
      context.req.header("x-forwarded-host") ??
      context.req.header("host") ??
      new URL(context.req.url).host;

    context.req.origin = `${protocol}://${host}`;
    context.req.basePath = basePath;

    await next();
  });
