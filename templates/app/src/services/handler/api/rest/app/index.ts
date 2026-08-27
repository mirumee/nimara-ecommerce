import { createAppSettingsRoutes } from "@nimara/lib/hono/saleor/settings-routes";

import { container } from "@/container";
import { appSettings } from "@/domain/app-config";

const CONFIG = container.get("config");

export const appRoutes = createAppSettingsRoutes({
  allowedDomains: CONFIG.ALLOWED_DOMAINS,
  getSettingsForm: container.get("getSettingsForm"),
  joseAuthService: container.get("joseAuthService"),
  saveSettings: container.get("saveSettings"),
  settingsSchema: appSettings,
});
