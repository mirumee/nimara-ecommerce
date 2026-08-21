import { describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";
import { type ConfigItemRepository } from "@nimara/infrastructure/config/types";

import {
  type PaymentGatewayConfig,
  type SaleorMultiTenantAppConfig,
} from "@/domain/app-config";

import { appConfigService } from "./app-config-service";

const SALEOR_DOMAIN = "saleor.example.com";

const DEFAULT_CREDENTIALS: PaymentGatewayConfig = {
  publicKey: "pk_default",
  secretKey: "sk_default",
};

const OVERRIDE_CREDENTIALS: PaymentGatewayConfig = {
  publicKey: "pk_override",
  secretKey: "sk_override",
};

const serviceWith = (channelOverrides: Record<string, PaymentGatewayConfig>) =>
  appConfigService({
    configStore: {
      get: vi.fn(async () =>
        ok({
          [SALEOR_DOMAIN]: {
            authToken: "token",
            saleorAppId: "app",
            saleorDomain: SALEOR_DOMAIN,
            paymentGatewayConfigSet: {
              default: DEFAULT_CREDENTIALS,
              channelOverrides,
            },
          },
        }),
      ),
      upsert: vi.fn(),
    } as unknown as ConfigItemRepository<SaleorMultiTenantAppConfig>,
  });

describe("appConfigService", () => {
  describe("updatePaymentGatewayConfigSet", () => {
    // The config screen runs before install in development, so a save must not
    // require a tenant entry that only the install flow writes.
    it("refuses an uninstalled tenant when creating one is not allowed", async () => {
      // given
      const upsert = vi.fn(async () => ok(true));
      const service = appConfigService({
        configStore: {
          get: vi.fn(async () => ok({})),
          upsert,
        } as unknown as ConfigItemRepository<SaleorMultiTenantAppConfig>,
      });

      // when
      const result = await service.updatePaymentGatewayConfigSet({
        saleorDomain: SALEOR_DOMAIN,
        data: {
          default: DEFAULT_CREDENTIALS,
          defaultChannelSlug: "default-channel",
          channelOverrides: {},
        },
      });

      // then
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors[0].code).toBe(
        "SALEOR_APP_CONFIG_NOT_FOUND_ERROR",
      );
      expect(upsert).not.toHaveBeenCalled();
    });

    it("creates the tenant entry when the app is not installed yet", async () => {
      // given
      const upsert = vi.fn(async () => ok(true));
      const service = appConfigService({
        configStore: {
          get: vi.fn(async () => ok({})),
          upsert,
        } as unknown as ConfigItemRepository<SaleorMultiTenantAppConfig>,
        createMissingTenant: true,
      });

      // when
      const result = await service.updatePaymentGatewayConfigSet({
        saleorDomain: SALEOR_DOMAIN,
        data: {
          default: DEFAULT_CREDENTIALS,
          defaultChannelSlug: "default-channel",
          channelOverrides: {},
        },
      });

      // then
      expect(result.ok).toBe(true);
      expect(upsert).toHaveBeenCalledWith({
        value: {
          [SALEOR_DOMAIN]: expect.objectContaining({
            authToken: "",
            saleorAppId: "",
            saleorDomain: SALEOR_DOMAIN,
            paymentGatewayConfigSet: expect.objectContaining({
              default: DEFAULT_CREDENTIALS,
            }),
          }),
        },
      });
    });
  });

  describe("getPaymentGatewayConfigForChannel", () => {
    it("falls back to the shared configuration", async () => {
      // given
      const service = serviceWith({});

      // when
      const result = await service.getPaymentGatewayConfigForChannel({
        channelSlug: "default-channel",
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok && result.data).toEqual(DEFAULT_CREDENTIALS);
    });

    it("prefers the channel override over the shared configuration", async () => {
      // given
      const service = serviceWith({ "eu-channel": OVERRIDE_CREDENTIALS });

      // when
      const result = await service.getPaymentGatewayConfigForChannel({
        channelSlug: "eu-channel",
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok && result.data).toEqual(OVERRIDE_CREDENTIALS);
    });

    it("serves the default channel from the shared config", async () => {
      // given
      const service = serviceWith({ "eu-channel": OVERRIDE_CREDENTIALS });

      // when
      const result = await service.getPaymentGatewayConfigForChannel({
        channelSlug: "default-channel",
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok && result.data).toEqual(DEFAULT_CREDENTIALS);
    });

    it("fails when neither an override nor a shared configuration exists", async () => {
      // given
      const service = appConfigService({
        configStore: {
          get: vi.fn(async () =>
            ok({
              [SALEOR_DOMAIN]: {
                authToken: "token",
                saleorAppId: "app",
                saleorDomain: SALEOR_DOMAIN,
                paymentGatewayConfigSet: {
                  default: null,
                  channelOverrides: {},
                },
              },
            }),
          ),
          upsert: vi.fn(),
        } as unknown as ConfigItemRepository<SaleorMultiTenantAppConfig>,
      });

      // when
      const result = await service.getPaymentGatewayConfigForChannel({
        channelSlug: "default-channel",
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors[0].code).toBe(
        "SALEOR_APP_CONFIG_NOT_FOUND_ERROR",
      );
    });
  });
});
