import { createContainer } from "iti";

import { saleorAppClient } from "@nimara/infrastructure/apps/saleor/client";
import { fileConfigItem } from "@nimara/infrastructure/config/file-config";
import { vercelEdgeConfigItem } from "@nimara/infrastructure/config/vercel-edge-config";
import { joseAuthService } from "@nimara/infrastructure/jose/auth/jose-auth-service";
import { jwksMemoryRepository } from "@nimara/infrastructure/jose/jwks/memory";
import { getLogger } from "@nimara/infrastructure/logging/service";
import { installSaleorAppUseCase } from "@nimara/infrastructure/use-cases/apps/saleor/install-app-use-case";

import { APP_CONFIG } from "@/apps/handler/config";
import { saleorMultiTenantAppConfig } from "@/domain/app-config";
import { appConfigService } from "@/infrastructure/app-config-service";
import { customerRepository } from "@/infrastructure/customer/repository";
import { paymentService } from "@/infrastructure/payment/service";
import { paymentMethodService } from "@/infrastructure/payment-method/service";
import { stripePaymentMethodRepository } from "@/infrastructure/payment-method/stripe/repository";
import { saleorClient } from "@/lib/saleor/client";
import { saleorUrlFromDomain } from "@/lib/saleor/url";
import { getConfigFormDataUseCase } from "@/use-cases/get-config-form-data-use-case";
import { saveConfigUseCase } from "@/use-cases/save-config-use-case";

export const container = createContainer()
  .add({
    config: () => APP_CONFIG,
    logger: () => getLogger({ name: "stripe" }),
  })
  .add((ctx) => ({
    // Multi-tenant config store: the whole `Record<domain, StripeAppConfig>`.
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
    appConfigService: () => appConfigService({ configStore: ctx.configStore }),
  }))
  .add((ctx) => ({
    paymentService: () =>
      paymentService({
        getGatewayConfig:
          ctx.appConfigService.getPaymentGatewayConfigForChannel,
        logger: ctx.logger,
      }),
  }))
  .add((ctx) => ({
    installApp: () =>
      installSaleorAppUseCase({
        configRepository: ctx.appConfigService,
        saleorAppClientFactory: saleorAppClient,
      }),
    paymentMethodService: () =>
      paymentMethodService({
        appConfigService: ctx.appConfigService,
        appId: ctx.config.APP_ID,
        customerRepository,
        environment: ctx.config.ENVIRONMENT,
        logger: ctx.logger,
        paymentMethodRepository: stripePaymentMethodRepository,
        saleorClient: ctx.saleorClient,
      }),
    getConfigFormData: () =>
      getConfigFormDataUseCase({
        appConfigService: ctx.appConfigService,
        joseAuthService: ctx.joseAuthService,
        saleorClient: ctx.saleorClient,
      }),
    saveConfig: () =>
      saveConfigUseCase({
        appConfigService: ctx.appConfigService,
        appId: ctx.config.APP_ID,
        environment: ctx.config.ENVIRONMENT,
        joseAuthService: ctx.joseAuthService,
        logger: ctx.logger,
      }),
  }));

export type AppContainer = typeof container;
