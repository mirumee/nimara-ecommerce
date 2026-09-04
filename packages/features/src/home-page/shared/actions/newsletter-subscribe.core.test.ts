import { describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { newsletterSubscribe } from "./newsletter-subscribe.core";

const buildServices = (newsletterSubscribeSpy: ReturnType<typeof vi.fn>) =>
  ({
    getNewsletterService: async () => ({
      newsletterSubscribe: newsletterSubscribeSpy,
    }),
  }) as unknown as ServiceRegistry;

describe("newsletterSubscribe", () => {
  it("forwards the address to the newsletter service unchanged", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));

    const result = await newsletterSubscribe(buildServices(spy), {
      email: "  shopper@example.com  ",
    });

    expect(spy).toHaveBeenCalledWith({ email: "  shopper@example.com  " });
    expect(result).toMatchObject({ ok: true });
  });

  it("returns the service failure unchanged", async () => {
    const spy = vi.fn(async () => ({
      ok: false as const,
      errors: [
        { code: "INVALID_VALUE_ERROR" as const, field: "email" },
      ] as const,
    }));

    const result = await newsletterSubscribe(
      buildServices(spy as unknown as ReturnType<typeof vi.fn>),
      { email: "not-an-address" },
    );

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });
});
