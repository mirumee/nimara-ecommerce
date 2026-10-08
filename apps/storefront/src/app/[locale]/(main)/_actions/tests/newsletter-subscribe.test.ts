import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";
import type { NewsletterService } from "@nimara/infrastructure/use-cases/newsletter/types";

const loggerError = vi.fn();
const installed: { service: NewsletterService | null } = { service: null };

vi.mock("@/envs/client", () => ({
  clientEnvs: { NEXT_PUBLIC_SALEOR_API_URL: undefined },
}));

vi.mock("@/services/registry", () => ({
  getServiceRegistry: async () => ({
    getNewsletterService: async () => installed.service,
  }),
}));

vi.mock("@/services/logging", () => ({
  storefrontLogger: { error: loggerError },
}));

const { emptyNewsletterService } =
  await import("@/services/utils/empty-services");
const { newsletterSubscribeAction } = await import("../newsletter-subscribe");

const installProvider = (
  newsletterSubscribe: NewsletterService["newsletterSubscribe"],
) => {
  installed.service = { newsletterSubscribe };
};

beforeEach(() => {
  vi.clearAllMocks();
  installed.service = emptyNewsletterService;
});

describe("newsletterSubscribeAction", () => {
  it("refuses a malformed address even when no provider is available", async () => {
    const result = await newsletterSubscribeAction({ email: "not-an-address" });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });

  it("logs a refusal when the capability answers that it is not configured", async () => {
    const result = await newsletterSubscribeAction({
      email: "shopper@example.com",
    });

    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_NOT_CONFIGURED_ERROR",
    });
    expect(loggerError).toHaveBeenCalledOnce();
  });

  it("redacts the developer message before answering the client", async () => {
    installProvider(async () =>
      err([
        {
          code: "NEWSLETTER_SUBSCRIBE_ERROR",
          message: "Klaviyo answered 400.",
          status: 400,
        },
      ]),
    );

    const result = await newsletterSubscribeAction({
      email: "shopper@example.com",
    });

    expect(result.errors?.[0]).toEqual({ code: "NEWSLETTER_SUBSCRIBE_ERROR" });
    expect(loggerError).not.toHaveBeenCalled();
  });

  it("passes a successful subscribe through", async () => {
    installProvider(async () => ok({ acknowledged: true }));

    const result = await newsletterSubscribeAction({
      email: "shopper@example.com",
    });

    expect(result).toMatchObject({ ok: true, data: { acknowledged: true } });
    expect(loggerError).not.toHaveBeenCalled();
  });
});
