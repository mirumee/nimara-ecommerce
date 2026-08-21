import { readFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { type Context, type Env } from "hono";

export const CLIENT_ASSET_ROUTE = "/assets/:file";

const ASSETS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  __CLIENT_ASSETS_DIR__,
);

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

/**
 * Serves the built client bundle from the server.
 *
 * Vercel's CDN only carries files that already exist when the deployment is
 * created, and these are written by the build, so the function has to answer
 * for them. On the `node` target CloudFront resolves `/assets/*` from S3 and
 * this route is never reached.
 */
export const clientAsset = async ({
  context,
}: {
  context: Context<Env, typeof CLIENT_ASSET_ROUTE>;
}) => {
  // Collapses any traversal an encoded separator could smuggle into the param.
  const name = basename(context.req.param("file"));
  const content = await readFile(join(ASSETS_DIR, name)).catch(() => null);

  if (!content) {
    return context.notFound();
  }

  return new Response(content, {
    headers: {
      "content-type":
        CONTENT_TYPES[extname(name)] ?? "application/octet-stream",
      // The file name carries no build hash, so a new deploy must win.
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
};
