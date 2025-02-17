import { describe, expect, it, vi } from "vitest";

import { CONFIG } from "@/config";

import { StripeMetaKey, type SupportedStripeWebhookEvent } from "./const";
import { isAppEvent } from "./util";

const MOCK_CONFIG = {
  APP_ID: "app_123",
  ENVIRONMENT: "production",
};

describe("isAppEvent", () => {
  it("should return true when issuer and environment match", async () => {
    // given
    const event = {
      data: {
        object: {
          metadata: {
            [StripeMetaKey.ISSUER]: MOCK_CONFIG.APP_ID,
            [StripeMetaKey.ENVIRONMENT]: MOCK_CONFIG.ENVIRONMENT,
          },
        },
      },
    } as unknown as SupportedStripeWebhookEvent;

    vi.spyOn(CONFIG, "ENVIRONMENT", "get").mockReturnValue(
      MOCK_CONFIG.ENVIRONMENT,
    );
    vi.spyOn(CONFIG, "APP_ID", "get").mockReturnValue(MOCK_CONFIG.APP_ID);

    // when
    const result = isAppEvent(event);

    // then
    expect(result).toBe(true);
  });

  it("should return false when issuer does not match", () => {
    // given
    const event = {
      data: {
        object: {
          metadata: {
            [StripeMetaKey.ISSUER]: "wrong_app",
            [StripeMetaKey.ENVIRONMENT]: MOCK_CONFIG.ENVIRONMENT,
          },
        },
      },
    } as unknown as SupportedStripeWebhookEvent;

    // when
    const result = isAppEvent(event);

    // then
    expect(result).toBe(false);
  });

  it("should return false when environment does not match", () => {
    // given
    const event = {
      data: {
        object: {
          metadata: {
            [StripeMetaKey.ISSUER]: MOCK_CONFIG.APP_ID,
            [StripeMetaKey.ENVIRONMENT]: "wrong_env",
          },
        },
      },
    } as unknown as SupportedStripeWebhookEvent;

    // when
    const result = isAppEvent(event);

    // then
    expect(result).toBe(false);
  });

  it("should return false when metadata is missing", () => {
    // given
    const event = {
      data: {
        object: {},
      },
    } as unknown as SupportedStripeWebhookEvent;

    // when
    const result = isAppEvent(event);

    // then
    expect(result).toBe(false);
  });
});
