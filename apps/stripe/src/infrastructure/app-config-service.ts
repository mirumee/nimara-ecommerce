import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { type SaleorAppConfig } from "@nimara/domain/objects/SaleorApp";
import { type ConfigItemRepository } from "@nimara/infrastructure/config/types";

import {
  type AppConfig,
  appConfig,
  emptyPaymentGatewayConfigSet,
  type PaymentGatewayConfig,
  type PaymentGatewayConfigSet,
  paymentGatewayConfigSet,
  type SaleorMultiTenantAppConfig,
} from "@/domain/app-config";

const notFound = (message: string) =>
  err([
    {
      code: "SALEOR_APP_CONFIG_NOT_FOUND_ERROR" as const,
      message,
      context: { description: "Missing configuration." },
      status: 422,
    },
  ]);

/**
 * Multi-tenant config provider over the whole tenant map (`Record<domain,
 * AppConfig>`). Also satisfies the infra `SaleorAppConfigRepository` so
 * the install use-case can persist the install record without knowing about
 * the app-specific gateway config.
 */
export const appConfigService = ({
  configStore,
}: {
  configStore: ConfigItemRepository<SaleorMultiTenantAppConfig>;
}) => {
  const getBySaleorDomain = async ({
    saleorDomain,
  }: {
    saleorDomain: string;
  }): AsyncResult<AppConfig | null> => {
    const result = await configStore.get();

    if (!result.ok) {
      return result;
    }

    return ok(result.data?.[saleorDomain] ?? null);
  };

  return {
    getBySaleorDomain,

    // Install: preserve an existing tenant's gateway config on reinstall.
    createOrUpdate: async ({
      config,
    }: {
      config: SaleorAppConfig;
    }): AsyncResult<SaleorAppConfig> => {
      const result = await configStore.get();

      if (!result.ok) {
        return result;
      }

      const configs = result.data ?? {};
      const current = configs[config.saleorDomain];
      const merged = appConfig.parse({
        ...config,
        paymentGatewayConfigSet:
          current?.paymentGatewayConfigSet ?? emptyPaymentGatewayConfigSet(),
      });

      const saved = await configStore.upsert({
        value: { ...configs, [config.saleorDomain]: merged },
      });

      if (!saved.ok) {
        return saved;
      }

      return ok(merged);
    },

    getPaymentGatewayConfigSet: async ({
      saleorDomain,
    }: {
      saleorDomain: string;
    }): AsyncResult<PaymentGatewayConfigSet | null> => {
      const result = await getBySaleorDomain({ saleorDomain });

      if (!result.ok) {
        return result;
      }

      return ok(result.data?.paymentGatewayConfigSet ?? null);
    },

    getPaymentGatewayConfigForChannel: async ({
      saleorDomain,
      channelSlug,
    }: {
      channelSlug: string;
      saleorDomain: string;
    }): AsyncResult<PaymentGatewayConfig> => {
      const result = await getBySaleorDomain({ saleorDomain });

      if (!result.ok) {
        return result;
      }

      const configSet = result.data?.paymentGatewayConfigSet;
      const config =
        configSet?.channelOverrides[channelSlug] ?? configSet?.default;

      if (!config) {
        return notFound(
          `Missing gateway config for ${saleorDomain} - ${channelSlug}.`,
        );
      }

      return ok(config);
    },

    updatePaymentGatewayConfigSet: async ({
      saleorDomain,
      data,
    }: {
      data: PaymentGatewayConfigSet;
      saleorDomain: string;
    }): AsyncResult<PaymentGatewayConfigSet> => {
      const result = await configStore.get();

      if (!result.ok) {
        return result;
      }

      const configs = result.data ?? {};
      const current = configs[saleorDomain];

      if (!current) {
        return notFound(`Missing config for ${saleorDomain} domain.`);
      }

      const gateway = paymentGatewayConfigSet.parse(data);
      const saved = await configStore.upsert({
        value: {
          ...configs,
          [saleorDomain]: { ...current, paymentGatewayConfigSet: gateway },
        },
      });

      if (!saved.ok) {
        return saved;
      }

      return ok(gateway);
    },
  };
};

export type AppConfigService = ReturnType<typeof appConfigService>;
