import { getAppSettingsFormUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/get-app-settings-form-use-case";
import { saveAppSettingsUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/save-app-settings-use-case";
import { createAppSettingsRoutes } from "@nimara/lib/hono/saleor/settings-routes";

import { appSettings, SECRET_FIELDS } from "@/domain/app-config";
import { container } from "@/services/handler/container";

const { appConfigService, config, joseAuthService } = container.items;

// Built here, not in the container: only these routes call them.
const settings = {
  configRepository: appConfigService,
  secretFields: SECRET_FIELDS,
  settingsSchema: appSettings,
};

export const appRoutes = createAppSettingsRoutes({
  allowedDomains: config.ALLOWED_DOMAINS,
  getSettingsForm: getAppSettingsFormUseCase(settings),
  joseAuthService,
  saveSettings: saveAppSettingsUseCase(settings),
  settingsSchema: appSettings,
});
