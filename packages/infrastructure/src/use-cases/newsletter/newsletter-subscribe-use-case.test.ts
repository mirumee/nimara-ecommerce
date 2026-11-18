import { describe, expect, it, vi } from "vitest";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { ok } from "@nimara/domain/objects/Result";

import { newsletterSubscribeUseCase } from "./newsletter-subscribe-use-case";
import type { NewsletterSubscribeInfra } from "./types";

const buildUseCase = (spy: ReturnType<typeof vi.fn>) =>
  newsletterSubscribeUseCase({
    newsletterSubscribeInfra: spy as unknown as NewsletterSubscribeInfra,
  });

const EMAIL_DOMAIN = "@example.com";

const buildAddressOfLength = (length: number) =>
  "a".repeat(length - EMAIL_DOMAIN.length) + EMAIL_DOMAIN;

describe("newsletterSubscribeUseCase", () => {
  it("forwards a trimmed address to the provider", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));

    const result = await buildUseCase(spy)({
      email: "  shopper@example.com  ",
    });

    expect(spy).toHaveBeenCalledWith({ email: "shopper@example.com" });
    expect(result).toMatchObject({ ok: true });
  });

  it("rejects a malformed address without calling the provider", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));

    const result = await buildUseCase(spy)({ email: "not-an-address" });

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

    const result = await buildUseCase(spy)({ email: overLimitEmail });

    expect(spy).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });

  it("forwards an address exactly at the bound to the provider", async () => {
    const spy = vi.fn(async () => ok({ acknowledged: true as const }));
    const boundaryEmail = buildAddressOfLength(FIELD_MAX_LENGTH.email);

    const result = await buildUseCase(spy)({ email: `  ${boundaryEmail}  ` });

    expect(spy).toHaveBeenCalledWith({ email: boundaryEmail });
    expect(result).toMatchObject({ ok: true });
  });

  it("returns the provider failure unchanged", async () => {
    const spy = vi.fn(async () => ({
      ok: false as const,
      errors: [{ code: "NEWSLETTER_TIMEOUT_ERROR" as const }] as const,
    }));

    const result = await buildUseCase(
      spy as unknown as ReturnType<typeof vi.fn>,
    )({ email: "shopper@example.com" });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]?.code).toBe("NEWSLETTER_TIMEOUT_ERROR");
  });
});
