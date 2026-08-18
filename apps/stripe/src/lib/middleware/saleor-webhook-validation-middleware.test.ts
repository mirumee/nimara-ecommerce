import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";

import { createTestApp } from "@/lib/test/app";

import { saleorWebhookValidationMiddleware } from "./saleor-webhook-validation-middleware";

const HEADERS = {
  "saleor-api-url": "https://saleor.example.com/graphql/",
  "saleor-domain": "saleor.example.com",
  "saleor-event": "transaction_initialize_session",
  "saleor-signature": "sig",
};

const ALLOWED_DOMAINS = ["saleor.example.com"];

const verifyDetachedJws = vi.fn();
const joseAuthService = vi.fn(() => ({
  verifyDetachedJws,
  verifyJwt: vi.fn(),
}));
const getInstallation = vi.fn();

const buildApp = () => {
  const routes = new Hono()
    .use(
      "*",
      ...saleorWebhookValidationMiddleware({
        allowedDomains: ALLOWED_DOMAINS,
        getInstallation,
        joseAuthService,
      }),
    )
    .post("/webhook", (context) => context.json({ status: "ok" }));

  return createTestApp({ app: routes });
};

const request = () =>
  buildApp().request("/webhook", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ event: "test" }),
  });

describe("saleor-webhook-validation-middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyDetachedJws.mockResolvedValue(ok(true));
    getInstallation.mockResolvedValue(
      ok({ saleorDomain: "saleor.example.com" }),
    );
  });

  it("calls the handler for an allowed, installed, verified webhook", async () => {
    // when
    const response = await request();

    // then
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(joseAuthService).toHaveBeenCalledWith("saleor.example.com");
  });

  it("returns 400 when Saleor headers are missing", async () => {
    // when
    const response = await buildApp().request("/webhook", {
      method: "POST",
      body: JSON.stringify({ event: "test" }),
    });

    // then
    expect(response.status).toBe(400);
    expect((await response.json()).description).toBe("Validation error.");
  });

  it("rejects a non-allowlisted domain before checking install or signature", async () => {
    // when
    const response = await buildApp().request("/webhook", {
      method: "POST",
      headers: { ...HEADERS, "saleor-domain": "evil.example.com" },
      body: JSON.stringify({ event: "test" }),
    });

    // then
    expect(response.status).toBe(401);
    expect((await response.json()).description).toBe(
      "Untrusted Saleor issuer.",
    );
    expect(getInstallation).not.toHaveBeenCalled();
    expect(verifyDetachedJws).not.toHaveBeenCalled();
  });

  it("rejects a domain that is not installed", async () => {
    // given
    getInstallation.mockResolvedValue(ok(null));

    // when
    const response = await request();

    // then
    expect(response.status).toBe(401);
    expect((await response.json()).description).toBe(
      "The app is not installed for this Saleor instance.",
    );
    expect(verifyDetachedJws).not.toHaveBeenCalled();
  });

  it("returns 401 when signature verification fails", async () => {
    // given
    verifyDetachedJws.mockResolvedValue(
      err([{ code: "JWT_VERIFICATION_ERROR", message: "Invalid signature" }]),
    );

    // when
    const response = await request();

    // then
    expect(response.status).toBe(401);
    expect((await response.json()).description).toBe(
      "Saleor webhook verification failed.",
    );
  });
});
