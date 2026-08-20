import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/test/app";

import { saleorDomainAllowlistMiddleware } from "./saleor-domain-allowlist-middleware";

const ALLOWED_DOMAINS = ["saleor.example.com"];

const buildApp = (allowedDomains = ALLOWED_DOMAINS) => {
  const routes = new Hono()
    .use("*", saleorDomainAllowlistMiddleware({ allowedDomains }))
    .post("/config/save", (context) => context.json({ status: "ok" }));

  return createTestApp({ app: routes });
};

const request = ({
  allowedDomains,
  body,
}: {
  allowedDomains?: string[];
  body?: string;
} = {}) =>
  buildApp(allowedDomains).request("/config/save", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ?? JSON.stringify({ saleorDomain: "saleor.example.com" }),
  });

describe("saleor-domain-allowlist-middleware", () => {
  it("calls the handler for an allowlisted Saleor", async () => {
    // when
    const response = await request();

    // then
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("refuses a Saleor this deployment does not serve", async () => {
    // when
    const response = await request({
      body: JSON.stringify({ saleorDomain: "evil.example.com" }),
    });

    // then
    expect(response.status).toBe(401);
    expect((await response.json()).description).toBe(
      "evil.example.com is not an allowed Saleor domain.",
    );
  });

  it("names the setting when no domain is allowed at all", async () => {
    // when
    const response = await request({ allowedDomains: [] });

    // then
    expect(response.status).toBe(401);
    expect((await response.json()).description).toContain("ALLOWED_DOMAINS");
  });

  it("refuses a body that names no Saleor", async () => {
    // when
    const response = await request({ body: JSON.stringify({}) });

    // then
    expect(response.status).toBe(401);
  });

  it("refuses a body that is not JSON instead of failing", async () => {
    // when
    const response = await request({ body: "not json" });

    // then
    expect(response.status).toBe(401);
  });
});
