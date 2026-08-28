import { getAppSettingsFormUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/get-app-settings-form-use-case";
import { saveAppSettingsUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/save-app-settings-use-case";
import { createAppSettingsRoutes } from "@nimara/lib/hono/saleor/settings-routes";

import { container } from "@/container";
import { appSettings, SECRET_FIELDS } from "@/domain/app-config";

const CONFIG = container.get("config");

// Built here, not in the container: only these routes call them.
const settings = {
  configRepository: container.get("appConfigService"),
  secretFields: SECRET_FIELDS,
  settingsSchema: appSettings,
};

export const appRoutes = createAppSettingsRoutes({
  allowedDomains: CONFIG.ALLOWED_DOMAINS,
  getSettingsForm: getAppSettingsFormUseCase(settings),
  joseAuthService: container.get("joseAuthService"),
  saveSettings: saveAppSettingsUseCase(settings),
  settingsSchema: appSettings,
});
