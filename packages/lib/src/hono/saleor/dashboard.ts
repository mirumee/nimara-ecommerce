import { Hono } from "hono";

import { createHtmlShell } from "#root/hono/html-shell";
import { nodeAssetsMiddleware } from "#root/hono/middleware/node-assets";
import { vercelAssetsMiddleware } from "#root/hono/middleware/vercel-assets";

/**
 * Mount at the app's root, so `appUrl` is the same with or without a dashboard.
 *
 * `assetsDir` comes from the caller: in dev this module is not bundled with the
 * service, so `import.meta.url` here names the library.
 */
export const createDashboardRoutes = ({
  assets,
  assetsDir,
  basePath = "",
  buildTarget,
  serviceName,
  title,
  version,
}: {
  assets: Record<string, string>;
  assetsDir: string;
  basePath?: string;
  buildTarget: "node" | "vercel";
  serviceName: string;
  title: string;
  version: string;
}) =>
  new Hono()
    .use(
      buildTarget === "vercel"
        ? vercelAssetsMiddleware({ assets, basePath })
        : nodeAssetsMiddleware({ basePath, dir: assetsDir }),
    )
    .get("/", createHtmlShell({ serviceName, title, version }));
