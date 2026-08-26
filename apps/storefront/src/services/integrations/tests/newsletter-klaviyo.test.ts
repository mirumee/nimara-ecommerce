import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";
import { klaviyoNewsletterSubscribeInfra } from "@nimara/infrastructure/newsletter/klaviyo/infrastructure/newsletter-subscribe-infra";

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
} satisfies Logger;

const subscribe = klaviyoNewsletterSubscribeInfra({
  listId: "LIST123",
  privateApiKey: "pk_secret",
  timeoutMs: 5_000,
  logger,
});

const EMAIL = "shopper@example.com";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Every logged argument, flattened, so a leaked address is visible. */
const loggedText = () => JSON.stringify(logger.error.mock.calls);

describe("klaviyoNewsletterSubscribeInfra", () => {
  it("reports success on the 202 acknowledgement", async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 202 });

    const result = await subscribe({ email: EMAIL });

    expect(result).toMatchObject({ ok: true, data: { acknowledged: true } });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;

    expect(url).toContain("/api/profile-subscription-bulk-create-jobs");
    expect(init.method).toBe("POST");
    expect(headers.Authorization).toBe("Klaviyo-API-Key pk_secret");
    expect(headers.revision).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const body = JSON.parse(String(init.body)) as {
      data: {
        attributes: { profiles: { data: [{ attributes: { email: string } }] } };
        relationships: { list: { data: { id: string } } };
      };
    };

    expect(body.data.relationships.list.data.id).toBe("LIST123");
    expect(body.data.attributes.profiles.data[0].attributes.email).toBe(EMAIL);
  });

  it("reports a subscribe error carrying the status when the provider rejects", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400 });

    const result = await subscribe({ email: EMAIL });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_SUBSCRIBE_ERROR",
      status: 400,
    });
    expect(logger.error).toHaveBeenCalled();
    expect(loggedText()).not.toContain(EMAIL);
  });

  it("reports a timeout error when the request is aborted", async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error("timed out"), { name: "TimeoutError" }),
    );

    const result = await subscribe({ email: EMAIL });

    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_TIMEOUT_ERROR",
    });
    expect(loggedText()).not.toContain(EMAIL);
  });

  it("reports a subscribe error when the network fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const result = await subscribe({ email: EMAIL });

    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_SUBSCRIBE_ERROR",
    });
    expect(loggedText()).not.toContain(EMAIL);
  });
});
