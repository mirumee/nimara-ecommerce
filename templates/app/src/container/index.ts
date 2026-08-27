import { createContainer } from "iti";

import { saleorAppClient } from "@nimara/infrastructure/apps/saleor/client";
import { saleorAppConfigRepository } from "@nimara/infrastructure/apps/saleor/config-repository";
import { fileConfigItem } from "@nimara/infrastructure/config/file-config";
import { vercelEdgeConfigItem } from "@nimara/infrastructure/config/vercel-edge-config";
import { joseAuthService } from "@nimara/infrastructure/jose/auth/jose-auth-service";
import { jwksMemoryRepository } from "@nimara/infrastructure/jose/jwks/memory";
import { getLogger } from "@nimara/infrastructure/logging/service";
import { getSaleorAppSettingsFormUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/get-app-settings-form-use-case";
import { installSaleorAppUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/install-app-use-case";
import { saveSaleorAppSettingsUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/save-app-settings-use-case";
import { saleorUrlFromDomain } from "@nimara/lib/saleor/url";

import {
  appSettings,
  saleorMultiTenantAppConfig,
  SECRET_FIELDS,
} from "@/domain/app-config";
import { saleorClient } from "@/infrastructure/saleor/client";
import { APP_CONFIG } from "@/services/handler/config";

export const container = createContainer()
  .add({
    config: () => APP_CONFIG,
    logger: () => getLogger({ name: APP_CONFIG.NAME }),
  })
  .add((ctx) => ({
    configStore: () =>
      ctx.config.CONFIG_PROVIDER === "file"
        ? fileConfigItem({
            schema: saleorMultiTenantAppConfig,
            logger: ctx.logger,
          })
        : vercelEdgeConfigItem({
            configKey: `${ctx.config.ENVIRONMENT}-${ctx.config.CONFIG_KEY}`,
            schema: saleorMultiTenantAppConfig,
            logger: ctx.logger,
          }),
    joseAuthService: () => (saleorDomain: string) =>
      joseAuthService({
        jwksRepository: jwksMemoryRepository({
          remoteUrl: saleorUrlFromDomain(saleorDomain),
          logger: ctx.logger,
        }),
      }),
    saleorClient: () =>
      saleorClient({
        logger: ctx.logger,
        timeout: ctx.config.FETCH_TIMEOUT,
      }),
  }))
  .add((ctx) => ({
    appConfigService: () =>
      saleorAppConfigRepository({
        configStore: ctx.configStore,
        settingsSchema: appSettings,
      }),
  }))
  .add((ctx) => ({
    getSettingsForm: () =>
      getSaleorAppSettingsFormUseCase({
        configRepository: ctx.appConfigService,
        secretFields: SECRET_FIELDS,
        settingsSchema: appSettings,
      }),
    installApp: () =>
      installSaleorAppUseCase({
        configRepository: ctx.appConfigService,
        saleorAppClientFactory: saleorAppClient,
      }),
    saveSettings: () =>
      saveSaleorAppSettingsUseCase({
        configRepository: ctx.appConfigService,
        secretFields: SECRET_FIELDS,
        settingsSchema: appSettings,
      }),
  }));

export type AppContainer = typeof container;
