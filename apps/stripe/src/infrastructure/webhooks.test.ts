import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { MagicMock } from "@nimara/lib/test/mock";
import { isLocalDomain } from "@nimara/lib/utils/url";

import { type PaymentGatewayConfig } from "@/domain/app-config";

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

const configFor = (secretKey: string): PaymentGatewayConfig => ({
  publicKey: "pk_test_123",
  secretKey,
});

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

  vi.mock("@nimara/lib/utils/url", () => ({
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

    it("keeps a gateway path prefix", () => {
      // given the app URL `getAppBaseUrl` builds behind a prefix. Registration
      // succeeds either way, so a dropped prefix only surfaces as a 404 on the
      // first event Stripe delivers.

      // when / then
      expect(
        getStripeWebhookUrl({
          appUrl: "https://example.com/stripe",
          saleorDomain: "saleor.example.com",
        }),
      ).toBe(
        "https://example.com/stripe/api/stripe/webhooks/saleor.example.com",
      );
    });
  });

  describe("installWebhooks", () => {
    it("does nothing when no configs carry a secretKey", async () => {
      // given
      const configs = [{ publicKey: "pk_test_123" }] as PaymentGatewayConfig[];
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        ...APP,
        configs,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("logs a warning and returns if the domain is local", async () => {
      // given
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await installWebhooks({
        ...APP,
        appUrl: "http://localhost:3000",
        configs: [configFor(mocks.secretKey)],
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(logger.warning).toHaveBeenCalledWith(
        "Unable to subscribe localhost domain. Stripe webhooks require domain which will be accessible from the network. Skipping.",
      );
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("creates one endpoint per Stripe account and shares it", async () => {
      // given
      const configs = [
        configFor(mocks.secretKey),
        configFor(mocks.secretKey),
        configFor("sk_test_other"),
      ];
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);

      // when
      await installWebhooks({
        ...APP,
        configs,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
      });

      // then
      expect(mocks.create).toHaveBeenCalledTimes(2);
      expect(getStripeApi).toHaveBeenCalledWith(mocks.secretKey);
      expect(getStripeApi).toHaveBeenCalledWith("sk_test_other");

      configs.forEach((config) => {
        expect(config.webhookId).toBe(mocks.webhookId);
        expect(config.webhookSecretKey).toBe("whsec_456");
      });
    });
  });

  describe("uninstallWebhooks", () => {
    it("does not reach Stripe when appUrl is localhost", async () => {
      // given
      const logger = MagicMock<{ warning: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(true);

      // when
      await uninstallWebhooks({
        ...APP,
        appUrl: "http://localhost:3000",
        // @ts-expect-error Mock
        logger,
        secretKeys: [mocks.secretKey],
      });

      // then
      expect(getStripeApi).not.toHaveBeenCalled();
    });

    it("deletes only this tenant's endpoints", async () => {
      // given
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
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
        secretKeys: [mocks.secretKey],
      });

      // then
      expect(mocks.del).toHaveBeenCalledTimes(1);
      expect(mocks.del).toHaveBeenCalledWith(mocks.webhookId);
    });

    it("logs an error without the secret key when deletion fails", async () => {
      // given
      const logger = MagicMock<{ error: Mock }>();

      (isLocalDomain as Mock).mockReturnValue(false);
      mocks.list.mockRejectedValueOnce(new Error("boom"));

      // when
      await uninstallWebhooks({
        ...APP,
        appUrl: "https://example.com",
        // @ts-expect-error Mock
        logger,
        secretKeys: [mocks.secretKey],
      });

      // then
      expect(logger.error).toHaveBeenCalledWith(
        "Could not delete stripe webhooks.",
        { saleorDomain: APP.saleorDomain },
      );
    });
  });
});
