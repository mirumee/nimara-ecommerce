import { type SaleorAppConfigService } from "@nimara/infrastructure/apps/saleor/config-repository";
import { getAppSettingsFormUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/get-app-settings-form-use-case";
import { saveAppSettingsUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/save-app-settings-use-case";

import {
  type AppSettings,
  appSettings,
  SECRET_FIELDS,
} from "@/domain/app-config";

/**
 * What only the dashboard calls. Kept apart from the rest of the container so
 * an app without one drops this file and the line adding it.
 */
export const dashboardUseCases = (ctx: {
  appConfigService: SaleorAppConfigService<AppSettings>;
}) => ({
  getSettingsForm: () =>
    getAppSettingsFormUseCase({
      configRepository: ctx.appConfigService,
      secretFields: SECRET_FIELDS,
      settingsSchema: appSettings,
    }),
  saveSettings: () =>
    saveAppSettingsUseCase({
      configRepository: ctx.appConfigService,
      secretFields: SECRET_FIELDS,
      settingsSchema: appSettings,
    }),
});
