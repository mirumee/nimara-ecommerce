import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { type MiddlewareHandler } from "hono";

import { type AssetOptions, assetResponse } from "@/lib/assets";

/**
 * Serves the client assets sitting next to the server bundle. CloudFront
 * answers these from S3 first, so this runs only where the bundle is served
 * without one in front of it.
 */
export const nodeAssetsMiddleware = ({
  basePath = "",
  dir,
  path = "/assets",
}: AssetOptions & { dir: string }): MiddlewareHandler => {
  const prefix = `${basePath}${path}/`;

  return async (context, next) => {
    const name =
      context.req.method === "GET" && context.req.path.startsWith(prefix)
        ? context.req.path.slice(prefix.length)
        : "";
    // `basename` collapses any traversal an encoded separator smuggled in.
    const content = name
      ? await readFile(join(dir, basename(name))).catch(() => null)
      : null;

    if (!content) {
      await next();

      return;
    }

    // A pooled `Buffer` can sit at an offset inside a shared `ArrayBuffer`,
    // which `Response` refuses; a copy hands it a buffer of its own.
    return assetResponse({ content: new Uint8Array(content), name });
  };
};
