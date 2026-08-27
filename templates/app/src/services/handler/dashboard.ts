import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createDashboardRoutes } from "@nimara/lib/hono/saleor/dashboard";

import { container } from "@/container";

const CONFIG = container.get("config");

// An app that ships no UI drops this file and the line mounting it.
export const dashboard = createDashboardRoutes({
  assets: __CLIENT_ASSETS__,
  assetsDir: join(dirname(fileURLToPath(import.meta.url)), "assets"),
  basePath: CONFIG.BASE_PATH,
  buildTarget: __BUILD_TARGET__,
  serviceName: CONFIG.SERVICE,
  title: CONFIG.DISPLAY_NAME,
  version: CONFIG.VERSION,
});
