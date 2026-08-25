import { type HonoRequest } from "hono";
import { describe, expect, it } from "vitest";

import { getAppBaseUrl } from "./util";

const request = ({ basePath, origin }: { basePath: string; origin: string }) =>
  ({ basePath, origin }) as HonoRequest;

describe("api util", () => {
  describe("getAppBaseUrl", () => {
    it("returns the bare origin when served at the root", () => {
      // given
      const req = request({ basePath: "", origin: "https://app.example.com" });

      // when
      const result = getAppBaseUrl(req);

      // then
      expect(result).toBe("https://app.example.com");
    });

    it("carries the prefix when served under a path", () => {
      // given a deployment behind a gateway prefix. Every URL the app hands
      // out — manifest, webhook target, gateway endpoint — is built from this,
      // and a dropped prefix only surfaces as a 404 on the first delivery.
      const req = request({
        basePath: "/stripe",
        origin: "https://app.example.com",
      });

      // when
      const result = getAppBaseUrl(req);

      // then
      expect(result).toBe("https://app.example.com/stripe");
    });
  });
});
