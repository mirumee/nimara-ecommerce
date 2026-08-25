import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";

import { requireSaleorTenant } from "#root/hono/saleor/tenant";
import { createTestApp } from "#root/hono/test/app";

import { saleorWebhookValidationMiddleware } from "./saleor-webhook-validation";

const HEADERS = {
  // Saleor always sends this; without it hono's json validator skips reading the
  // body and the middleware is never exercised against a consumed request.
  "content-type": "application/json",
  "saleor-api-url": "https://saleor.example.com/graphql/",
  "saleor-domain": "saleor.example.com",
  "saleor-event": "transaction_initialize_session",
  "saleor-signature": "sig",
};

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
        getInstallation,
        joseAuthService,
      }),
    )
    .post("/webhook", (context) =>
      context.json({ status: "ok", ...requireSaleorTenant(context) }),
    );

  return createTestApp({ app: routes });
};

const request = () =>
  buildApp().request("/webhook", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ event: "test" }),
  });

describe("saleor-webhook-validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyDetachedJws.mockResolvedValue(ok(true));
    getInstallation.mockResolvedValue(
      ok({ saleorDomain: "saleor.example.com" }),
    );
  });

  it("publishes the tenant that signed the payload", async () => {
    // when
    const response = await request();

    // then handlers scope their reads and writes by this, not by the payload.
    expect(await response.json()).toMatchObject({
      saleorApiUrl: HEADERS["saleor-api-url"],
      saleorDomain: HEADERS["saleor-domain"],
    });
  });

  it("calls the handler for an allowed, installed, verified webhook", async () => {
    // when
    const response = await request();

    // then
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok" });
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

  it("verifies the byte-exact body after the json validator consumed it", async () => {
    // given
    const body = '{"event":"test",  "nested":{"a":1}}';

    // when
    const response = await buildApp().request("/webhook", {
      method: "POST",
      headers: HEADERS,
      body,
    });

    // then
    expect(response.status).toBe(200);
    expect(verifyDetachedJws).toHaveBeenCalledWith({
      jws: "sig",
      payload: body,
    });
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
