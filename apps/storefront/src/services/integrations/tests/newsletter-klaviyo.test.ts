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

const EMAIL_POINTER = "/data/attributes/profiles/data/0/attributes/email";

const REJECTION_BODY = {
  errors: [
    {
      code: "invalid",
      title: "Invalid input.",
      detail: `Invalid email: ${EMAIL}`,
      source: { pointer: EMAIL_POINTER },
    },
  ],
};

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loggedText = () => JSON.stringify(logger.error.mock.calls);

describe("klaviyoNewsletterSubscribeInfra", () => {
  it("reports success on the 202 acknowledgement", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 202,
      text: () => Promise.resolve(""),
    });

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
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify(REJECTION_BODY)),
    });

    const result = await subscribe({ email: EMAIL });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_SUBSCRIBE_ERROR",
      status: 400,
    });
    expect(logger.error).toHaveBeenCalled();
    expect(loggedText()).not.toContain(EMAIL);
  });

  it("logs the error code and field pointer the provider returned", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify(REJECTION_BODY)),
    });

    await subscribe({ email: EMAIL });

    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 400,
        errors: [{ code: "invalid", pointer: EMAIL_POINTER }],
      }),
    );
  });

  it("keeps the provider detail text out of the log because it echoes the address", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify(REJECTION_BODY)),
    });

    await subscribe({ email: EMAIL });

    expect(loggedText()).not.toContain(EMAIL);
    expect(loggedText()).not.toContain("Invalid email");
  });

  it("reports a rejection whose body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve("<html>Bad gateway</html>"),
    });

    const result = await subscribe({ email: EMAIL });

    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_SUBSCRIBE_ERROR",
      status: 502,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 502, errors: null }),
    );
  });

  it("reports a rejection whose body cannot be read", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error("stream closed")),
    });

    const result = await subscribe({ email: EMAIL });

    expect(result.errors?.[0]).toMatchObject({
      code: "NEWSLETTER_SUBSCRIBE_ERROR",
      status: 500,
    });
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ errors: null }),
    );
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
    expect(logger.error).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ timedOut: false, reason: "fetch failed" }),
    );
    expect(loggedText()).not.toContain(EMAIL);
  });
});
