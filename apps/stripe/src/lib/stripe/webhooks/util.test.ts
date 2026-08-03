import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { MagicMock } from "@/lib/test/mock";
import { isLocalDomain } from "@/lib/util";

import { getStripeApi } from "../api"; // Adjust import as needed
import { installWebhooks, uninstallWebhooks } from "./util";

describe("util", () => {
  const mocks = vi.hoisted(() => {
    const webhookId = "wh_123";

    return {
      webhookId,
      secretKey: "sk_test_123",
      otherSecretKey: "sk_test_456",
      webhookCreatedData: {
        id: webhookId,
        secret: "whsec_456",
      },
      webhookListData: {
        data: [
          {
            id: webhookId,
            metadata: {
              ISSUER: "APP_ID",
              ENVIRONMENT: "test",
            },
          },
        ],
      },
    };
  });

  vi.mock("../api", () => ({
    getStripeApi: vi.fn(() => ({
      webhookEndpoints: {
        create: vi.fn(async () => mocks.webhookCreatedData),
      },
      list: vi.fn(async () => mocks.webhookListData),
      del: vi.fn(async () => ({})),
    })),
  }));

  vi.mock("@/lib/util", () => ({
    isLocalDomain: vi.fn(),
  }));

  vi.mock("./gatewayMetadata", () => ({
    getGatewayMetadata: vi.fn(() => ({})),
  }));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const appUrl = "https://example.com";
  const saleorDomain = "saleor.example.com";

  const channelConfig = (
    config: Partial<PaymentGatewayConfig[string]> = {},
  ): PaymentGatewayConfig[string] => ({
    currency: "usd",
    publicKey: "pk_test_123",
    secretKey: "",
    ...config,
  });

  describe("installWebhooks", () => {
    it("does nothing when no channel has a secretKey", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig(),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(logger.warning).not.toHaveBeenCalled();
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("logs a warning and returns if the domain is local", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({ secretKey: mocks.secretKey }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl: "http://localhost:3000",
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(logger.warning).toHaveBeenCalledWith(
        "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
      );
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("creates a webhook endpoint and updates configuration", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({ secretKey: mocks.secretKey }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(paymentGatewayConfig.default.webhookId).toBe(
        mocks.webhookCreatedData.id,
      );
      expect(paymentGatewayConfig.default.webhookSecretKey).toBe(
        mocks.webhookCreatedData.secret,
      );
    });

    it("points the endpoint at this installation's path", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({ secretKey: mocks.secretKey }),
      };
      const logger = MagicMock<{ warning: Mock }>();
      const create = vi.fn(async () => mocks.webhookCreatedData);

      (isLocalDomain as Mock).mockReturnValue(false);
      (getStripeApi as Mock).mockReturnValue({
        webhookEndpoints: { create },
      });

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `${appUrl}/api/stripe/webhooks/${saleorDomain}`,
        }),
      );
    });

    it("creates one endpoint for channels sharing a Stripe account", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({ secretKey: mocks.secretKey }),
        "channel-uk": channelConfig({ secretKey: mocks.secretKey }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledTimes(1);
      /**
       * Both channels must carry the shared endpoint's signing secret, because
       * an event names its channel and is verified with that channel's secret.
       */
      expect(paymentGatewayConfig["channel-uk"].webhookSecretKey).toBe(
        mocks.webhookCreatedData.secret,
      );
      expect(paymentGatewayConfig.default.webhookSecretKey).toBe(
        mocks.webhookCreatedData.secret,
      );
    });

    it("creates an endpoint per Stripe account", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({ secretKey: mocks.secretKey }),
        "channel-uk": channelConfig({ secretKey: mocks.otherSecretKey }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledTimes(2);
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(getStripeApi).toHaveBeenCalledWith(mocks.otherSecretKey);
    });
  });

  describe("uninstallWebhooks", () => {
    it("does nothing when appUrl is localhost", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({
          webhookId: mocks.webhookId,
          secretKey: mocks.secretKey,
        }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await uninstallWebhooks({
        paymentGatewayConfig,
        appUrl: "http://localhost:3000",
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
      expect(paymentGatewayConfig.default.webhookId).toBeUndefined();
      expect(paymentGatewayConfig.default.webhookSecretKey).toBeUndefined();
    });

    it("deletes matching webhooks and clears configuration", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({
          webhookId: mocks.webhookId,
          secretKey: mocks.secretKey,
        }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await uninstallWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(paymentGatewayConfig.default.webhookId).toBeUndefined();
      expect(paymentGatewayConfig.default.webhookSecretKey).toBeUndefined();
    });

    it("clears configuration of a channel that has no secretKey", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({
          webhookId: mocks.webhookId,
          webhookSecretKey: mocks.webhookCreatedData.secret,
        }),
      };
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await uninstallWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
      expect(paymentGatewayConfig.default.webhookId).toBeUndefined();
      expect(paymentGatewayConfig.default.webhookSecretKey).toBeUndefined();
    });

    it("logs an error when webhook deletion fails", async () => {
      // given
      const paymentGatewayConfig: PaymentGatewayConfig = {
        default: channelConfig({
          webhookId: mocks.webhookId,
          secretKey: mocks.secretKey,
        }),
      };
      const logger = MagicMock<{ error: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await uninstallWebhooks({
        paymentGatewayConfig,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
      });

      // then
      expect(logger.error).toHaveBeenCalledWith(
        "Could not delete stripe webhook",
        {
          webhookIds: ["wh_123"],
        },
      );
    });
  });
});
