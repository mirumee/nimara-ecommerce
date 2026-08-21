import { type MiddlewareHandler } from "hono";

import { type AssetOptions, assetResponse } from "@/lib/assets";

/**
 * Serves the client assets the build baked into this bundle. Vercel's CDN
 * carries a file only if it exists before `buildCommand` runs, and the function
 * carries only what the deploy could trace through imports, so assets written
 * by the build travel as base64 in `__CLIENT_ASSETS__` (see `etc/build.ts`).
 */
export const vercelAssetsMiddleware = ({
  assets,
  basePath = "",
  path = "/assets",
}: AssetOptions & { assets: Record<string, string> }): MiddlewareHandler => {
  const prefix = `${basePath}${path}/`;

  return async (context, next) => {
    const name =
      context.req.method === "GET" && context.req.path.startsWith(prefix)
        ? context.req.path.slice(prefix.length)
        : "";
    // An exact lookup, so no request can name a file the build did not emit.
    const asset = assets[name];

    if (!asset) {
      await next();

      return;
    }

    return assetResponse({ content: Buffer.from(asset, "base64"), name });
  };
};
