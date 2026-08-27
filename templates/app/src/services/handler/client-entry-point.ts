import { createHtmlShell } from "@nimara/lib/hono/html-shell";

import { container } from "@/container";

const CONFIG = container.get("config");

export const clientEntryPoint = createHtmlShell({
  serviceName: CONFIG.SERVICE,
  title: CONFIG.DISPLAY_NAME,
  version: CONFIG.VERSION,
});
