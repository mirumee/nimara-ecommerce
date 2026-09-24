import { describe, expect, it, vi } from "vitest";

vi.mock("@/envs/client", () => ({
  clientEnvs: { NEXT_PUBLIC_SALEOR_API_URL: undefined },
}));

const { emptyNewsletterService } = await import("./empty-services");

describe("emptyNewsletterService", () => {
  it("refuses a valid address because no provider is configured", async () => {
    const result = await emptyNewsletterService.newsletterSubscribe({
      email: "shopper@example.com",
    });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_NOT_CONFIGURED_ERROR",
    });
  });

  it("refuses a malformed address before it reports the missing configuration", async () => {
    const result = await emptyNewsletterService.newsletterSubscribe({
      email: "not-an-address",
    });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "INVALID_VALUE_ERROR",
      field: "email",
    });
  });
});
