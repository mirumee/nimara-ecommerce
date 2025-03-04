import { describe, expect, it, type Mock, vi } from "vitest";

import { type PaymentGatewayConfig } from "@/lib/saleor/config/schema";
import { MagicMock } from "@/lib/test/mock";
import { isLocalDomain } from "@/lib/util";

import { getStripeApi } from "../api"; // Adjust import as needed
import { installWebhook, uninstallWebhooks } from "./util";

describe("util", () => {
  const mocks = vi.hoisted(() => {
    const webhookId = "wh_123";

    return {
      webhookId,
      secretKey: "sk_test_123",
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

  describe("installWebhook", () => {
    it("does nothing when secretKey is missing", async () => {
      // given
      const configuration = {} as PaymentGatewayConfig[string];
      const appUrl = "https://example.com";
      const logger = MagicMock<{ warning: Mock }>();
      const saleorDomain = "saleor.example.com";
      const channel = "default";

      // when
      await installWebhook({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
        channel,
      });

      // then
      expect(logger.warning).not.toHaveBeenCalled();
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("logs a warning and returns if the domain is local", async () => {
      // given
      const configuration = {
        secretKey: mocks.secretKey,
      } as PaymentGatewayConfig[string];
      const appUrl = "http://localhost:3000";
      const logger = MagicMock<{ warning: Mock }>();
      const saleorDomain = "saleor.example.com";
      const channel = "default";

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await installWebhook({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
        channel,
      });

      // then
      expect(logger.warning).toHaveBeenCalledWith(
        "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
      );
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("creates a webhook endpoint and updates configuration", async () => {
      // given
      const configuration = {
        secretKey: mocks.secretKey,
      } as PaymentGatewayConfig[string];
      const appUrl = "https://example.com";
      const logger = MagicMock<{ warning: Mock }>();
      const saleorDomain = "saleor.example.com";
      const channel = "default";

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhook({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
        saleorDomain,
        channel,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(configuration.webhookId).toBe(mocks.webhookCreatedData.id);
      expect(configuration.webhookSecretKey).toBe(
        mocks.webhookCreatedData.secret,
      );
    });
  });

  describe("uninstallWebhooks", () => {
    it("does nothing when appUrl is localhost", async () => {
      // given
      const configuration = {
        webhookId: mocks.webhookId,
        secretKey: mocks.secretKey,
      } as PaymentGatewayConfig[string];
      const appUrl = "http://localhost:3000";
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await uninstallWebhooks({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
      expect(configuration.webhookId).toBeUndefined();
      expect(configuration.webhookSecretKey).toBeUndefined();
    });

    it("deletes matching webhooks and clears configuration", async () => {
      // given
      const configuration = {
        webhookId: mocks.webhookId,
        secretKey: mocks.secretKey,
      } as PaymentGatewayConfig[string];
      const appUrl = "https://example.com";
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await uninstallWebhooks({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(configuration.webhookId).toBeUndefined();
      expect(configuration.webhookSecretKey).toBeUndefined();
    });

    it("logs an error when webhook deletion fails", async () => {
      // given
      const configuration = {
        webhookId: mocks.webhookId,
        secretKey: mocks.secretKey,
      } as PaymentGatewayConfig[string];
      const appUrl = "https://example.com";
      const logger = MagicMock<{ error: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await uninstallWebhooks({
        configuration,
        appUrl,
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(logger.error).toHaveBeenCalledWith(
        "Could not delete stripe webhook",
        {
          webhookId: "wh_123",
        },
      );
    });
  });
});
