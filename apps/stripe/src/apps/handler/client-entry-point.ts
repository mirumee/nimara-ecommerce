import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createHtmlShell } from "@nimara/lib/hono/html-shell";

import { container } from "@/container";

// The build names the client bundle after the `src/apps/<name>` directory.
const APP_NAME = basename(dirname(fileURLToPath(import.meta.url)));

const CONFIG = container.get("config");

export const clientEntryPoint = createHtmlShell({
  appName: APP_NAME,
  title: CONFIG.DISPLAY_NAME,
  version: CONFIG.VERSION,
});
