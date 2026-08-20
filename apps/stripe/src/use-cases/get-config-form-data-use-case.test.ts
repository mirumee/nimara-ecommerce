import { describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";
import { type JoseAuthService } from "@nimara/infrastructure/jose/auth/types";

import { type PaymentGatewayConfigSet } from "@/domain/app-config";
import { type AppConfigService } from "@/infrastructure/app-config-service";
import { type SaleorClient } from "@/lib/saleor/client";
import { MagicMock } from "@/lib/test/mock";

import { getConfigFormDataUseCase } from "./get-config-form-data-use-case";

const channel = (slug: string) => ({
  slug,
  name: slug.toUpperCase(),
  currencyCode: "USD",
});

const run = ({
  channels,
  storedConfig,
}: {
  channels: ReturnType<typeof channel>[];
  storedConfig: PaymentGatewayConfigSet | null;
}) =>
  getConfigFormDataUseCase({
    appConfigService: {
      getPaymentGatewayConfigSet: vi.fn(async () => ok(storedConfig)),
    } as unknown as AppConfigService,
    joseAuthService: () =>
      MagicMock<JoseAuthService>({ verifyJwt: vi.fn(async () => ok(true)) }),
    saleorClient: () =>
      ({
        execute: vi.fn(async () => ({ channels })),
      }) as unknown as SaleorClient,
  })({ accessToken: "token", saleorDomain: "saleor.example.com" });

describe("get-config-form-data-use-case", () => {
  describe("getConfigFormDataUseCase", () => {
    it("returns the stored default channel", async () => {
      // given / when
      const result = await run({
        channels: [channel("channel-us"), channel("channel-uk")],
        storedConfig: {
          default: null,
          defaultChannelSlug: "channel-uk",
          channelOverrides: {},
        },
      });

      // then
      expect(result.ok && result.data.config.defaultChannelSlug).toBe(
        "channel-uk",
      );
    });

    /**
     * Nothing is chosen until an operator picks, so a first-time installation
     * on a Saleor with any slug convention can still be configured.
     */
    it("has no default channel before one is chosen", async () => {
      // given / when
      const result = await run({
        channels: [channel("channel-us")],
        storedConfig: null,
      });

      // then
      expect(result.ok && result.data.config.defaultChannelSlug).toBeNull();
      expect(result.ok && result.data.channels).toHaveLength(1);
    });

    it("drops a stored channel this Saleor no longer has", async () => {
      // given / when
      const result = await run({
        channels: [channel("channel-us")],
        storedConfig: {
          default: null,
          defaultChannelSlug: "retired-channel",
          channelOverrides: {},
        },
      });

      // then
      expect(result.ok && result.data.config.defaultChannelSlug).toBeNull();
    });
  });
});
