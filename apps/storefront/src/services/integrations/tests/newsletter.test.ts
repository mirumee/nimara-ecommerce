import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";
import { createNewsletterService } from "@nimara/infrastructure/newsletter/select";

const envMock: Record<string, string | undefined> = {
  SEARCH_SERVICE: "saleor",
  CMS_SERVICE: "saleor",
  NEWSLETTER_SERVICE: undefined,
  ENVIRONMENT: "LOCAL",
};

vi.mock("@/envs/client", () => ({ clientEnvs: envMock }));
vi.mock("@/envs/server", () => ({ serverEnvs: envMock }));

const { resolveNewsletterProvider } = await import("../resolve");
const { emptyNewsletterService } =
  await import("@/services/utils/empty-services");

const fakeLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
} satisfies Logger;

const BREVO_ENV = {
  NEWSLETTER_BREVO_API_KEY: "xkeysib-test",
  NEWSLETTER_BREVO_LIST_IDS: "4,9",
  NEWSLETTER_BREVO_DOI_TEMPLATE_ID: '{"default":12,"en-GB":15}',
  NEWSLETTER_BREVO_REDIRECT_URL: "https://store.example/newsletter/confirmed",
};

const SUBMISSION = {
  email: "shopper@example.com",
  name: "Ada",
  locale: "en",
  consent: {
    consentedAt: "2026-08-18T10:00:00.000Z",
    privacyPolicyUrl: "https://store.example/page/privacy-policy",
  },
};

const brevoService = () =>
  createNewsletterService("brevo", { env: BREVO_ENV, logger: fakeLogger });

const respondWith = (status: number, body: unknown = {}) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );

describe("resolveNewsletterProvider", () => {
  beforeEach(() => {
    envMock.NEWSLETTER_SERVICE = undefined;
  });

  it("is off when the selector is unset — there is no default provider", () => {
    expect(resolveNewsletterProvider()).toBeNull();
  });

  it("returns the selected provider", () => {
    envMock.NEWSLETTER_SERVICE = "brevo";

    expect(resolveNewsletterProvider()).toBe("brevo");
  });
});

describe("emptyNewsletterService", () => {
  it("fails instead of fabricating a success when the action is called directly", async () => {
    const result = await emptyNewsletterService.newsletterSubscribe();

    expect(result.ok).toBe(false);
    expect(result.errors?.[0].code).toBe("NEWSLETTER_NOT_CONFIGURED_ERROR");
  });
});

describe("createNewsletterService", () => {
  it("rejects when brevo is selected without its configuration", async () => {
    await expect(
      createNewsletterService("brevo", { env: {}, logger: fakeLogger }),
    ).rejects.toThrow(/NEWSLETTER_BREVO_API_KEY/);
  });

  it("builds the dummy provider with no extra config", async () => {
    await expect(
      createNewsletterService("dummy", { env: {}, logger: fakeLogger }),
    ).resolves.toBeTruthy();
  });
});

describe("newsletter consent enforcement", () => {
  afterEach(() => vi.restoreAllMocks());

  it("never reaches the provider when consent data is missing", async () => {
    const fetchSpy = respondWith(201);
    const service = await brevoService();

    const result = await service.newsletterSubscribe({
      ...SUBMISSION,
      consent: { consentedAt: "", privacyPolicyUrl: "" },
    });

    expect(result.ok).toBe(false);
    expect(result.errors?.[0].code).toBe("NEWSLETTER_CONSENT_REQUIRED_ERROR");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects a relative privacy-policy URL, which is not a consent record", async () => {
    const fetchSpy = respondWith(201);
    const service = await brevoService();

    const result = await service.newsletterSubscribe({
      ...SUBMISSION,
      consent: { ...SUBMISSION.consent, privacyPolicyUrl: "/privacy-policy" },
    });

    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("brevo newsletter adapter", () => {
  afterEach(() => vi.restoreAllMocks());

  it("posts the double-opt-in request with configuration, not caller arguments", async () => {
    const fetchSpy = respondWith(201);
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(true);
    expect(result.data).toBe("CONFIRMATION_PENDING");

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];

    expect(url).toBe(
      "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
    );
    expect(init.method).toBe("POST");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(String(init.body))).toMatchObject({
      email: "shopper@example.com",
      includeListIds: [4, 9],
      templateId: 12,
      redirectionUrl: "https://store.example/newsletter/confirmed",
      attributes: {
        FIRSTNAME: "Ada",
        CONSENT_AT: "2026-08-18T10:00:00.000Z",
        CONSENT_URL: "https://store.example/page/privacy-policy",
      },
    });
  });

  it("selects the confirmation template for the shopper's locale", async () => {
    const fetchSpy = respondWith(201);
    const service = await brevoService();

    await service.newsletterSubscribe({ ...SUBMISSION, locale: "en-GB" });

    expect(JSON.parse(String(fetchSpy.mock.calls[0]?.[1]?.body))).toMatchObject(
      { templateId: 15 },
    );
  });

  it("reports an address the provider rejected as its own outcome class", async () => {
    respondWith(400, {
      code: "invalid_parameter",
      message: "Invalid email address",
    });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(false);
    expect(result.errors?.[0].code).toBe("NEWSLETTER_ADDRESS_REJECTED_ERROR");
  });

  it("does not blame the address for a 400 about the configured list", async () => {
    respondWith(400, {
      code: "invalid_parameter",
      message: "includeListIds must contain existing list ids",
    });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    // Telling the shopper to check what they typed would send them to fix the
    // operator's misconfiguration, which they cannot.
    expect(result.errors?.[0].code).toBe(
      "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
    );
  });

  it("does not blame the address for a 400 about a missing consent attribute", async () => {
    respondWith(400, {
      code: "invalid_parameter",
      message: "Attribute CONSENT_AT does not exist",
    });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.errors?.[0].code).toBe(
      "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
    );
  });

  it("logs which field the provider named, so a failure is diagnosable", async () => {
    respondWith(400, {
      code: "invalid_parameter",
      message: "redirectionUrl is not a valid url",
    });
    const service = await brevoService();

    await service.newsletterSubscribe(SUBMISSION);

    expect(fakeLogger.info).toHaveBeenCalledWith(
      "Newsletter subscribe finished",
      expect.objectContaining({
        outcome: "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
        providerCode: "invalid_parameter",
        providerField: "redirectionUrl",
      }),
    );
  });

  it("reports an exhausted send quota separately from an outage", async () => {
    respondWith(402, { code: "not_enough_credits", message: "no credits" });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(false);
    expect(result.errors?.[0].code).toBe("NEWSLETTER_QUOTA_EXCEEDED_ERROR");
  });

  it("reports a rate-limited call as quota rather than a rejected address", async () => {
    respondWith(429, { code: "too_many_requests" });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.errors?.[0].code).toBe("NEWSLETTER_QUOTA_EXCEEDED_ERROR");
  });

  it("reports a provider outage as unavailability", async () => {
    respondWith(503, {});
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.errors?.[0].code).toBe(
      "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
    );
  });

  it("answers an address already on the list exactly like a new one", async () => {
    respondWith(400, {
      code: "duplicate_parameter",
      message: "Contact already exist",
    });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(true);
    expect(result.data).toBe("CONFIRMATION_PENDING");
  });

  it("fails once on a timeout and issues no retry", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new DOMException("timed out", "TimeoutError"));
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(false);
    expect(result.errors?.[0].code).toBe(
      "NEWSLETTER_PROVIDER_UNAVAILABLE_ERROR",
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps the subscriber and the provider message out of the logs", async () => {
    const message =
      'Invalid email address "shopper@example.com" for contact Ada';

    respondWith(400, { code: "invalid_parameter", message });
    const service = await brevoService();

    const result = await service.newsletterSubscribe(SUBMISSION);
    const emitted = JSON.stringify([
      fakeLogger.info.mock.calls,
      fakeLogger.error.mock.calls,
      result,
    ]);

    // Brevo echoes the submitted contact in `message`, so neither the message
    // nor anything derived from it may reach a log line or an error result.
    expect(emitted).not.toContain("shopper@example.com");
    expect(emitted).not.toContain("Ada");
    expect(emitted).not.toContain(message);
    // The diagnostic that replaces it: the code and the field name.
    expect(emitted).toContain("invalid_parameter");
    expect(emitted).toContain("email");
  });
});

describe("dummy newsletter adapter", () => {
  afterEach(() => vi.restoreAllMocks());

  it("carries the happy path without an outbound call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const service = await createNewsletterService("dummy", {
      env: {},
      logger: fakeLogger,
    });

    const result = await service.newsletterSubscribe(SUBMISSION);

    expect(result.ok).toBe(true);
    expect(result.data).toBe("CONFIRMATION_PENDING");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
