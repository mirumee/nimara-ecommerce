import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";
import { MagicMock } from "@nimara/lib/test/mock";

import {
  type PaymentGatewayConfig,
  type PaymentGatewayConfigSet,
} from "@/domain/app-config";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { resolveStripeAccountId } from "@/infrastructure/utils";
import { installWebhooks, uninstallWebhooks } from "@/infrastructure/webhooks";

import {
  carryOverWebhooks,
  droppedSecretKeys,
  saveConfigUseCase,
} from "./save-config-use-case";

const config = (
  secretKey: string,
  endpoint?: { webhookId?: string; webhookSecretKey?: string },
): PaymentGatewayConfig => ({
  publicKey: `pk_${secretKey}`,
  secretKey,
  ...endpoint,
});

vi.mock("@/infrastructure/utils", () => ({
  resolveStripeAccountId: vi.fn(async () => "acct_123"),
}));

vi.mock("@/infrastructure/webhooks", () => ({
  installWebhooks: vi.fn(),
  uninstallWebhooks: vi.fn(),
}));

const SALEOR_DOMAIN = "saleor.example.com";
const DEFAULT_CHANNEL = "default-channel";
const APP_URL = "https://example.com";

const INSTALLED_DEFAULT = {
  accountId: "acct_123",
  publicKey: "pk_default",
  secretKey: "sk_default",
  webhookId: "wh_default",
  webhookSecretKey: "whsec_default",
};

const buildUseCase = (storedConfig: PaymentGatewayConfigSet) => {
  const updatePaymentGatewayConfigSet = vi.fn(async () => ok(storedConfig));

  const useCase = saveConfigUseCase({
    appConfigService: {
      getPaymentGatewayConfigSet: vi.fn(async () => ok(storedConfig)),
      updatePaymentGatewayConfigSet,
    } as unknown as AppConfigService,
    appId: "app_123",
    environment: "test",
    logger: MagicMock(),
  });

  return { updatePaymentGatewayConfigSet, useCase };
};

const savedConfig = (
  updatePaymentGatewayConfigSet: Mock,
): PaymentGatewayConfigSet =>
  updatePaymentGatewayConfigSet.mock.calls[0][0].data;

describe("save-config-use-case", () => {
  describe("droppedSecretKeys", () => {
    it("reports a key no channel uses any more", () => {
      // given
      const stored = [config("sk_default"), config("sk_eu")];
      const updated = [config("sk_default")];

      // when / then
      expect(droppedSecretKeys({ stored, updated })).toEqual(["sk_eu"]);
    });

    it("keeps a key another channel still shares", () => {
      // given
      const stored = [config("sk_shared"), config("sk_shared")];
      const updated = [config("sk_shared")];

      // when / then
      expect(droppedSecretKeys({ stored, updated })).toEqual([]);
    });

    it("reports a dropped key once, however many channels used it", () => {
      // given
      const stored = [config("sk_shared"), config("sk_shared")];

      // when / then
      expect(droppedSecretKeys({ stored, updated: [] })).toEqual(["sk_shared"]);
    });
  });

  describe("carryOverWebhooks", () => {
    it("gives every channel on that key the installed endpoint", () => {
      // given
      const stored = [
        config("sk_shared", {
          webhookId: "wh_1",
          webhookSecretKey: "whsec_1",
        }),
      ];
      const updated = [config("sk_shared"), config("sk_shared")];

      // when
      carryOverWebhooks({ stored, updated });

      // then
      updated.forEach((config) => {
        expect(config.webhookId).toBe("wh_1");
        expect(config.webhookSecretKey).toBe("whsec_1");
      });
    });

    it("leaves a secret key that has no endpoint yet", () => {
      // given
      const stored = [
        config("sk_old", {
          webhookId: "wh_1",
          webhookSecretKey: "whsec_1",
        }),
      ];
      const updated = [config("sk_new")];

      // when
      carryOverWebhooks({ stored, updated });

      // then
      expect(updated[0].webhookId).toBeUndefined();
    });

    it("ignores a half-installed endpoint, so the save reinstalls it", () => {
      // given
      const stored = [config("sk_default", { webhookId: "wh_1" })];
      const updated = [config("sk_default")];

      // when
      carryOverWebhooks({ stored, updated });

      // then
      expect(updated[0].webhookId).toBeUndefined();
      expect(updated[0].webhookSecretKey).toBeUndefined();
    });
  });

  describe("saveConfigUseCase", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("keeps the installed endpoint when the secret key survives the save", async () => {
      // given
      const { updatePaymentGatewayConfigSet, useCase } = buildUseCase({
        default: INSTALLED_DEFAULT,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {},
      });

      // when
      const result = await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {},
          default: { publicKey: "pk_updated", secretKey: "sk_default" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok).toBe(true);
      expect(installWebhooks).not.toHaveBeenCalled();
      expect(uninstallWebhooks).not.toHaveBeenCalled();
      expect(savedConfig(updatePaymentGatewayConfigSet).default).toMatchObject({
        publicKey: "pk_updated",
        webhookId: "wh_default",
        webhookSecretKey: "whsec_default",
      });
    });

    it("installs an endpoint only for a newly added channel override", async () => {
      // given
      const { useCase } = buildUseCase({
        default: INSTALLED_DEFAULT,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {},
      });

      // when
      await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {
            "eu-channel": { publicKey: "pk_eu", secretKey: "sk_eu" },
          },
          default: { publicKey: "pk_default", secretKey: "sk_default" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(uninstallWebhooks).not.toHaveBeenCalled();
      expect(installWebhooks).toHaveBeenCalledWith(
        expect.objectContaining({
          configs: [expect.objectContaining({ secretKey: "sk_eu" })],
        }),
      );
    });

    it("uninstalls the endpoints of secret keys the installation dropped", async () => {
      // given
      const { useCase } = buildUseCase({
        default: INSTALLED_DEFAULT,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {
          "eu-channel": {
            accountId: "acct_eu",
            publicKey: "pk_eu",
            secretKey: "sk_eu",
            webhookId: "wh_eu",
            webhookSecretKey: "whsec_eu",
          },
        },
      });

      // when
      await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {},
          default: { publicKey: "pk_default", secretKey: "sk_default" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(uninstallWebhooks).toHaveBeenCalledWith(
        expect.objectContaining({ secretKeys: ["sk_eu"] }),
      );
      expect(installWebhooks).not.toHaveBeenCalled();
    });

    it("keeps the stored secret key when the field comes back blank", async () => {
      // given
      const { updatePaymentGatewayConfigSet, useCase } = buildUseCase({
        default: INSTALLED_DEFAULT,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {},
      });

      // when
      const result = await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {},
          default: { publicKey: "pk_updated", secretKey: "" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok).toBe(true);
      expect(savedConfig(updatePaymentGatewayConfigSet).default).toMatchObject({
        publicKey: "pk_updated",
        secretKey: "sk_default",
        webhookId: "wh_default",
      });
      // A blank field must not read as a key change and churn the endpoint.
      expect(installWebhooks).not.toHaveBeenCalled();
      expect(uninstallWebhooks).not.toHaveBeenCalled();
      expect(resolveStripeAccountId).toHaveBeenCalledWith(
        expect.objectContaining({ secretKey: "sk_default" }),
      );
    });

    it("fails when nothing is stored and no secret key was entered", async () => {
      // given
      const { updatePaymentGatewayConfigSet, useCase } = buildUseCase({
        default: null,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {},
      });

      // when
      const result = await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {},
          default: { publicKey: "pk_new", secretKey: "" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(result.ok).toBe(false);
      expect(!result.ok && result.errors[0].code).toBe(
        "SALEOR_APP_CONFIG_SAVE_ERROR",
      );
      expect(updatePaymentGatewayConfigSet).not.toHaveBeenCalled();
    });

    it("resolves the Stripe account once per secret key", async () => {
      // given
      const { useCase } = buildUseCase({
        default: null,
        defaultChannelSlug: DEFAULT_CHANNEL,
        channelOverrides: {},
      });

      // when
      await useCase({
        appUrl: APP_URL,
        data: {
          channelOverrides: {
            "eu-channel": { publicKey: "pk_default", secretKey: "sk_default" },
          },
          default: { publicKey: "pk_default", secretKey: "sk_default" },
          defaultChannelSlug: DEFAULT_CHANNEL,
        },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(resolveStripeAccountId).toHaveBeenCalledTimes(1);
    });
  });
});
