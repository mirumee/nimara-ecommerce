import { describe, expect, it } from "vitest";

import { app } from "@/services/handler/entry-server";

const HOST = "app.test";
const ORIGIN_HEADERS = { host: HOST, "x-forwarded-proto": "https" };

describe("saleor routes", () => {
  describe("GET /api/saleor/manifest", () => {
    it("announces the webhooks the app registers", async () => {
      // when
      const response = await app.request("/api/saleor/manifest", {
        headers: ORIGIN_HEADERS,
      });

      // then a webhook missing here is one Saleor will never call.
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        tokenTargetUrl: `https://${HOST}/api/saleor/register`,
        webhooks: [
          {
            asyncEvents: ["PRODUCT_UPDATED"],
            name: "ProductUpdated",
            targetUrl: `https://${HOST}/api/saleor/webhooks/product-updated`,
          },
        ],
      });
    });
  });

  describe("POST /api/saleor/register", () => {
    it("refuses an installation that sends no Saleor headers", async () => {
      // when
      const response = await app.request("/api/saleor/register", {
        method: "POST",
        headers: { ...ORIGIN_HEADERS, "content-type": "application/json" },
        body: JSON.stringify({ auth_token: "token" }),
      });

      // then
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/saleor/webhooks/product-updated", () => {
    it("refuses a webhook that carries no signature", async () => {
      // when
      const response = await app.request(
        "/api/saleor/webhooks/product-updated",
        {
          method: "POST",
          headers: { ...ORIGIN_HEADERS, "content-type": "application/json" },
          body: JSON.stringify({ event: {} }),
        },
      );

      // then it is refused as an unlisted domain, before anything reads the
      // payload — the allowlist runs in front of the signature check.
      expect(response.status).toBe(401);
    });
  });
});
