import { type HonoRequest } from "hono";
import { describe, expect, it } from "vitest";

import { getStripeWebhookUrl } from "@/infrastructure/webhooks";

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
      // given
      const req = request({
        basePath: "/stripe",
        origin: "https://app.example.com",
      });

      // when
      const result = getAppBaseUrl(req);

      // then
      expect(result).toBe("https://app.example.com/stripe");
    });

    it("keeps the prefix on the Stripe endpoint registered with Stripe", () => {
      // given a deployment behind a gateway prefix. Registration succeeds
      // either way, so a dropped prefix only surfaces as a 404 on the first
      // event Stripe delivers.
      const req = request({
        basePath: "/stripe",
        origin: "https://app.example.com",
      });

      // when
      const result = getStripeWebhookUrl({
        appUrl: getAppBaseUrl(req),
        saleorDomain: "saleor.example.com",
      });

      // then
      expect(result).toBe(
        "https://app.example.com/stripe/api/stripe/webhooks/saleor.example.com",
      );
    });
  });
});
