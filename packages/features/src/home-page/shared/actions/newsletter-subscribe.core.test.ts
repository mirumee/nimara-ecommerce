import { describe, expect, it, vi } from "vitest";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { ok } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

import { newsletterSubscribe } from "./newsletter-subscribe.core";

const buildServices = (newsletterSubscribeSpy: ReturnType<typeof vi.fn>) =>
  ({
    getNewsletterService: async () => ({
      newsletterSubscribe: newsletterSubscribeSpy,
    }),
  }) as unknown as ServiceRegistry;

const EMAIL_DOMAIN = "@example.com";

const buildAddressOfLength = (length: number) =>
  "a".repeat(length - EMAIL_DOMAIN.length) + EMAIL_DOMAIN;

describe("newsletterSubscribe", () => {
  it("forwards a valid address to the newsletter service", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));

    const result = await newsletterSubscribe(buildServices(spy), {
      email: "  shopper@example.com  ",
    });

    expect(spy).toHaveBeenCalledWith({ email: "shopper@example.com" });
    expect(result).toMatchObject({ ok: true });
  });

  it("rejects a malformed address without calling the provider", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));

    const result = await newsletterSubscribe(buildServices(spy), {
      email: "not-an-address",
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });

  it("rejects an address longer than the bound without calling the provider", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));
    const overLimitEmail = buildAddressOfLength(FIELD_MAX_LENGTH.email + 1);

    const result = await newsletterSubscribe(buildServices(spy), {
      email: overLimitEmail,
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });

  it("forwards an address exactly at the bound to the newsletter service", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));
    const boundaryEmail = buildAddressOfLength(FIELD_MAX_LENGTH.email);

    const result = await newsletterSubscribe(buildServices(spy), {
      email: `  ${boundaryEmail}  `,
    });

    expect(spy).toHaveBeenCalledWith({ email: boundaryEmail });
    expect(result).toMatchObject({ ok: true });
  });

  it("returns the provider failure unchanged", async () => {
    const spy = vi.fn(async () => ({
      ok: false as const,
      errors: [{ code: "NEWSLETTER_TIMEOUT_ERROR" as const }] as const,
    }));

    const result = await newsletterSubscribe(
      buildServices(spy as unknown as ReturnType<typeof vi.fn>),
      { email: "shopper@example.com" },
    );

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]?.code).toBe("NEWSLETTER_TIMEOUT_ERROR");
  });
});
