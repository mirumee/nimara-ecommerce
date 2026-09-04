import { type MiddlewareHandler } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ok } from "@nimara/domain/objects/Result";
import { type SaleorAppManifest } from "@nimara/domain/objects/SaleorApp";

import { requestOriginMiddleware } from "#root/hono/middleware/request-origin";
import { createSaleorRoutes } from "#root/hono/saleor/routes";
import { type HandlerContext } from "#root/hono/saleor/types";
import { createTestApp } from "#root/hono/test/app";
import { type SaleorWebhook } from "#root/saleor/webhooks";

const installApp = vi.fn();

const basePathMiddleware =
  (basePath: string): MiddlewareHandler =>
  async (context, next) => {
    context.req.basePath = basePath;

    await next();
  };

const webhook: SaleorWebhook<HandlerContext<any>> = {
  handler: (context, { saleorDomain }) => context.json({ saleorDomain }),
  name: "TransactionInitializeSession",
  path: "/transaction-initialize-session",
  query: { toString: () => "subscription { event }" },
  syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
};

const testApp = ({
  allowedDomains = [] as string[],
  basePath = "",
  webhookMiddlewares = [],
}: {
  allowedDomains?: string[];
  basePath?: string;
  webhookMiddlewares?: MiddlewareHandler[];
} = {}) =>
  createTestApp({
    app: createSaleorRoutes({
      allowedDomains,
      installApp,
      manifest: {
        appPath: "/app",
        id: "TEST.app",
        logoPath: "/logo.png",
        name: "TEST.app",
        permissions: ["HANDLE_PAYMENTS"],
        version: "1.0.0",
      },
      webhookMiddlewares,
      webhooks: [webhook],
    }),
    middlewares: [requestOriginMiddleware(), basePathMiddleware(basePath)],
  });

const register = ({
  allowedDomains,
  saleorDomain,
}: {
  allowedDomains: string[];
  saleorDomain: string;
}) =>
  testApp({ allowedDomains }).request("/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "saleor-api-url": `https://${saleorDomain}/graphql/`,
      "saleor-domain": saleorDomain,
    },
    body: JSON.stringify({ auth_token: "token" }),
  });

describe("saleor routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installApp.mockResolvedValue(ok({}));
  });

  describe("manifest", () => {
    it("derives the webhook entries from the registry", async () => {
      // when
      const response = await testApp().request("/manifest");
      const manifest = (await response.json()) as SaleorAppManifest;

      // then
      expect(manifest.webhooks).toEqual([
        {
          asyncEvents: [],
          name: "TransactionInitializeSession",
          query: "subscription { event }",
          syncEvents: ["TRANSACTION_INITIALIZE_SESSION"],
          targetUrl:
            "http://localhost/api/saleor/webhooks/transaction-initialize-session",
        },
      ]);
    });

    it("builds its own URLs from the path the app is served under", async () => {
      // given an app behind a gateway prefix: Saleor calls back only what the
      // manifest names, so a dropped prefix breaks installation, not just links.

      // when
      const response = await testApp({ basePath: "/stripe" }).request(
        "/manifest",
      );
      const manifest = (await response.json()) as SaleorAppManifest;

      // then
      expect(manifest.appUrl).toBe("http://localhost/stripe/app");
      expect(manifest.tokenTargetUrl).toBe(
        "http://localhost/stripe/api/saleor/register",
      );
      expect(manifest.brand?.logo.default).toBe(
        "http://localhost/stripe/logo.png",
      );
    });
  });

  describe("register", () => {
    it("refuses every domain when the allowlist is unconfigured", async () => {
      // when
      const response = await register({
        allowedDomains: [],
        saleorDomain: "saleor.example.com",
      });

      // then
      expect(response.status).toBe(401);
      expect(await response.text()).toContain("ALLOWED_DOMAINS");
      expect(installApp).not.toHaveBeenCalled();
    });

    it("names the domain, not the setting, when a configured allowlist omits it", async () => {
      // when
      const response = await register({
        allowedDomains: ["other.example.com"],
        saleorDomain: "saleor.example.com",
      });
      const body = await response.text();

      // then
      expect(response.status).toBe(401);
      expect(body).toContain("saleor.example.com");
      expect(body).not.toContain("ALLOWED_DOMAINS");
    });

    it("installs for a domain the allowlist admits", async () => {
      // when
      const response = await register({
        allowedDomains: ["saleor.example.com"],
        saleorDomain: "saleor.example.com",
      });

      // then
      expect(response.status).toBe(200);
      expect(installApp).toHaveBeenCalledWith({
        authToken: "token",
        saleorDomain: "saleor.example.com",
        saleorUrl: "https://saleor.example.com",
      });
    });
  });

  describe("webhooks", () => {
    const callWebhook = ({
      allowedDomains,
      saleorDomain,
      webhookMiddlewares,
    }: {
      allowedDomains: string[];
      saleorDomain: string;
      webhookMiddlewares: MiddlewareHandler[];
    }) =>
      testApp({ allowedDomains, webhookMiddlewares }).request(
        "/webhooks/transaction-initialize-session",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "saleor-domain": saleorDomain,
          },
          body: JSON.stringify({ event: "test" }),
        },
      );

    it("guards webhooks with the same allowlist installation uses", async () => {
      // given a domain the app was never allowed to install for
      const webhookMiddleware = vi.fn(async (_context, next) => next());

      // when
      const response = await callWebhook({
        allowedDomains: ["saleor.example.com"],
        saleorDomain: "evil.example.com",
        webhookMiddlewares: [webhookMiddleware],
      });

      // then it is rejected before signature verification is even attempted.
      expect(response.status).toBe(401);
      expect(webhookMiddleware).not.toHaveBeenCalled();
    });

    it("admits a domain the allowlist names", async () => {
      // given a stand-in for the middleware that verifies and publishes
      const publishTenant: MiddlewareHandler = async (context, next) => {
        context.set("saleorApiUrl", "https://saleor.example.com/graphql/");
        context.set("saleorDomain", "saleor.example.com");

        await next();
      };

      // when
      const response = await callWebhook({
        allowedDomains: ["saleor.example.com"],
        saleorDomain: "saleor.example.com",
        webhookMiddlewares: [publishTenant],
      });

      // then
      expect(response.status).toBe(200);
    });

    it("refuses a webhook no middleware published a tenant for", async () => {
      // when
      const response = await callWebhook({
        allowedDomains: ["saleor.example.com"],
        saleorDomain: "saleor.example.com",
        webhookMiddlewares: [],
      });

      // then the handler is never reached without a verified tenant.
      expect(response.status).toBe(401);
    });
  });
});
