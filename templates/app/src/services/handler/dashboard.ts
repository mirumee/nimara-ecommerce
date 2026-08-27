import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { Hono } from "hono";

import { nodeAssetsMiddleware } from "@nimara/lib/hono/middleware/node-assets";
import { vercelAssetsMiddleware } from "@nimara/lib/hono/middleware/vercel-assets";

import { container } from "@/container";

import { clientEntryPoint } from "./client-entry-point";

const CONFIG = container.get("config");

/**
 * The page Saleor loads in its dashboard iframe, and the client bundle it
 * pulls. An app that ships no UI drops this file and the line mounting it.
 *
 * Vercel traces only what a build imports, so there the assets ride inside the
 * server bundle; a node build serves them off disk.
 */
export const dashboard = new Hono()
  .use(
    __BUILD_TARGET__ === "vercel"
      ? vercelAssetsMiddleware({
          assets: __CLIENT_ASSETS__,
          basePath: CONFIG.BASE_PATH,
        })
      : nodeAssetsMiddleware({
          basePath: CONFIG.BASE_PATH,
          dir: join(dirname(fileURLToPath(import.meta.url)), "assets"),
        }),
  )
  .get("/", clientEntryPoint);
