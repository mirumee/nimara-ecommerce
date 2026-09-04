import { describe, expect, it } from "vitest";

import { app } from "@/services/handler/entry-server";

const ORIGIN_HEADERS = { host: "app.test", "x-forwarded-proto": "https" };

describe("dashboard", () => {
  describe("GET /", () => {
    it("serves the page Saleor loads in its iframe", async () => {
      // when
      const response = await app.request("/", { headers: ORIGIN_HEADERS });
      const body = await response.text();

      // then the client bundle mounts on this element, ahead of the text
      // route that answers when an app ships no dashboard.
      expect(response.status).toBe(200);
      expect(body).toContain('<div id="root">');
    });

    it("hands the client the base path and the version it renders", async () => {
      // when
      const response = await app.request("/", { headers: ORIGIN_HEADERS });

      // then the client reads them off `window.env`, not off an API call.
      expect(await response.text()).toMatch(/window\.env = \{.*"VERSION".*\}/);
    });
  });

  describe("POST /api/app/config/fetch", () => {
    it("refuses a caller with no Saleor token", async () => {
      // when
      const response = await app.request("/api/app/config/fetch", {
        method: "POST",
        headers: ORIGIN_HEADERS,
      });

      // then the config holds secrets, so an unverified caller reads nothing.
      expect(response.status).toBe(401);
    });
  });
});
