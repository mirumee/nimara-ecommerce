import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { createTestApp } from "#root/hono/test/app";

import { requireSaleorTenant, saleorTenantMiddleware } from "./tenant";

const TENANT = {
  saleorApiUrl: "https://saleor.example.com/graphql/",
  saleorDomain: "saleor.example.com",
};

const publishTenant = new Hono().use(async (context, next) => {
  context.set("saleorApiUrl", TENANT.saleorApiUrl);
  context.set("saleorDomain", TENANT.saleorDomain);

  await next();
});

describe("tenant", () => {
  describe("requireSaleorTenant", () => {
    it("returns the tenant a middleware verified", async () => {
      // given
      const routes = new Hono()
        .route("/", publishTenant)
        .get("/tenant", (context) =>
          context.json(requireSaleorTenant(context)),
        );

      // when
      const response = await createTestApp({ app: routes }).request("/tenant");

      // then
      expect(await response.json()).toEqual(TENANT);
    });

    it("refuses a route no auth middleware guards", async () => {
      // given
      const routes = new Hono().get("/tenant", (context) =>
        context.json(requireSaleorTenant(context)),
      );

      // when
      const response = await createTestApp({ app: routes }).request("/tenant");

      // then
      expect(response.status).toBe(401);
    });
  });

  describe("saleorTenantMiddleware", () => {
    it("stops a tenant-scoped route reached without a verified tenant", async () => {
      // given
      let reached = false;
      const routes = new Hono()
        .use(saleorTenantMiddleware())
        .get("/scoped", (context) => {
          reached = true;

          return context.json({ status: "ok" });
        });

      // when
      const response = await createTestApp({ app: routes }).request("/scoped");

      // then
      expect(response.status).toBe(401);
      expect(reached).toBe(false);
    });

    it("lets a verified request through", async () => {
      // given
      const routes = new Hono()
        .route("/", publishTenant)
        .use(saleorTenantMiddleware())
        .get("/scoped", (context) => context.json({ status: "ok" }));

      // when
      const response = await createTestApp({ app: routes }).request("/scoped");

      // then
      expect(response.status).toBe(200);
    });
  });
});
