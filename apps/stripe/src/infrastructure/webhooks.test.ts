import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { type PaymentGatewayConfig } from "@/domain/app-config";
import { MagicMock } from "@/lib/test/mock";
import { isLocalDomain } from "@/lib/util";

import { getStripeApi } from "./utils";
import {
  getStripeWebhookUrl,
  installWebhooks,
  uninstallWebhooks,
} from "./webhooks";

const APP = {
  appId: "app_123",
  environment: "test",
  saleorDomain: "saleor.example.com",
};

describe("webhooks", () => {
  const mocks = vi.hoisted(() => {
    const webhookId = "wh_123";

    return {
      webhookId,
      secretKey: "sk_test_123",
      create: vi.fn(async () => ({ id: webhookId, secret: "whsec_456" })),
      list: vi.fn(async () => ({
        data: [
          {
            id: webhookId,
            metadata: {
              issuer: "app_123",
              environment: "test",
              saleorDomain: "saleor.example.com",
            },
          },
        ],
      })),
      del: vi.fn(async () => ({})),
    };
  });

  vi.mock("./utils", () => ({
    getStripeApi: vi.fn(() => ({
      webhookEndpoints: {
        create: mocks.create,
        list: mocks.list,
        del: mocks.del,
      },
    })),
  }));

  vi.mock("@/lib/util", () => ({
    isLocalDomain: vi.fn(),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStripeWebhookUrl", () => {
    it("builds the per-installation URL with an encoded domain", () => {
      // when / then
      expect(
        getStripeWebhookUrl({
          appUrl: "https://example.com",
          saleorDomain: "saleor.example.com",
        }),
      ).toBe("https://example.com/api/stripe/webhooks/saleor.example.com");
    });
  });

  describe("installWebhooks", () => {
    it("does nothing when no channel has a secretKey", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": {},
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("logs a warning and returns if the domain is local", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": { secretKey: mocks.secretKey },
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await installWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "http://localhost:3000",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(logger.warning).toHaveBeenCalledWith(
        "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
      );
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("creates one endpoint per Stripe account and shares it across channels", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": { secretKey: mocks.secretKey },
        "second-channel": { secretKey: mocks.secretKey },
        "other-account": { secretKey: "sk_test_other" },
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(mocks.create).toHaveBeenCalledTimes(2);
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(getStripeApi).toHaveBeenCalledWith("sk_test_other");

      Object.values(paymentGatewayConfig).forEach((configuration) => {
        expect(configuration.webhookId).toBe(mocks.webhookId);
        expect(configuration.webhookSecretKey).toBe("whsec_456");
      });
    });
  });

  describe("uninstallWebhooks", () => {
    it("only clears configuration when appUrl is localhost", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": {
          secretKey: mocks.secretKey,
          webhookId: mocks.webhookId,
          webhookSecretKey: "whsec_456",
        },
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await uninstallWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "http://localhost:3000",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
      expect(paymentGatewayConfig["default-channel"].webhookId).toBeUndefined();
      expect(
        paymentGatewayConfig["default-channel"].webhookSecretKey,
      ).toBeUndefined();
    });

    it("deletes only this tenant's endpoints and clears configuration", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": {
          secretKey: mocks.secretKey,
          webhookId: mocks.webhookId,
          webhookSecretKey: "whsec_456",
        },
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);
      mocks.list.mockResolvedValueOnce({
        data: [
          {
            id: mocks.webhookId,
            metadata: {
              issuer: APP.appId,
              environment: APP.environment,
              saleorDomain: APP.saleorDomain,
            },
          },
          {
            id: "wh_other_tenant",
            metadata: {
              issuer: APP.appId,
              environment: APP.environment,
              saleorDomain: "other.example.com",
            },
          },
        ],
      });

      // when
      await uninstallWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(mocks.del).toHaveBeenCalledTimes(1);
      expect(mocks.del).toHaveBeenCalledWith(mocks.webhookId);
      expect(paymentGatewayConfig["default-channel"].webhookId).toBeUndefined();
      expect(
        paymentGatewayConfig["default-channel"].webhookSecretKey,
      ).toBeUndefined();
    });

    it("logs an error when webhook deletion fails", async () => {
      // given
      const paymentGatewayConfig = {
        "default-channel": {
          secretKey: mocks.secretKey,
          webhookId: mocks.webhookId,
        },
      } as unknown as PaymentGatewayConfig;
      const logger = MagicMock<{ error: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);
      mocks.list.mockRejectedValueOnce(new Error("boom"));

      // when
      await uninstallWebhooks({
        ...APP,
        paymentGatewayConfig,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(logger.error).toHaveBeenCalledWith(
        "Could not delete stripe webhook",
        {
          webhookIds: [mocks.webhookId],
        },
      );
    });
  });
});
