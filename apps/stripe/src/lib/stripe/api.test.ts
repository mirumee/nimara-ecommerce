import Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";

import { responseError } from "@/lib/api/util";

import { stripeRouteErrorsHandler } from "./api";

describe("api", () => {
  describe("stripeRouteErrorsHandler", () => {
    vi.mock("@/lib/api/util", () => ({
      responseError: vi.fn(() => new Response("error", { status: 400 })),
    }));

    vi.mock("@/providers/logging", () => ({
      getLoggingProvider: vi.fn(() => ({
        error: vi.fn(),
      })),
    }));

    it("returns response from handler on success", async () => {
      // given
      const mockHandler = vi.fn(async () => new Response("success"));
      const request = new Request("https://example.com");

      // when
      const result = await stripeRouteErrorsHandler(mockHandler)(request);

      // then
      expect(result.status).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it("returns error response for StripeSignatureVerificationError", async () => {
      // given
      const error = new Stripe.errors.StripeSignatureVerificationError({
        type: "api_error",
        message: "Invalid signature",
      });
      const mockHandler = vi.fn(async () => {
        throw error;
      });
      const request = new Request("https://example.com", {
        body: JSON.stringify({ id: "evt_123" }),
        method: "POST",
        headers: { "content-type": "application/json" },
      });

      // when
      const result = await stripeRouteErrorsHandler(mockHandler)(request);

      // then
      expect(result.status).toBe(400);
      expect(responseError).toHaveBeenCalledWith({
        description: "Failed to verify Stripe webhook.",
        context: "headers > stripe-signature",
        errors: [{ message: error.message }],
      });
    });

    it("returns error response for generic StripeError", async () => {
      // given
      const error = new Stripe.errors.StripeError({
        type: "api_error",
        message: "Ops! I did it again!",
      });
      const mockHandler = vi.fn(async () => {
        throw error;
      });

      const request = new Request("https://example.com", {
        body: JSON.stringify({ id: "evt_123" }),
        method: "POST",
        headers: { "content-type": "application/json" },
      });

      // when
      const result = await stripeRouteErrorsHandler(mockHandler)(request);

      // then
      expect(result.status).toBe(400);
      expect(responseError).toHaveBeenCalledWith({
        description: "Stripe error occurred.",
        errors: [{ message: error.message }],
      });
    });

    it("throws error for non-Stripe errors", async () => {
      // given
      const mockHandler = vi.fn(async () => {
        throw new Error("Unknown error");
      });

      const request = new Request("https://example.com");

      // when & then
      await expect(
        stripeRouteErrorsHandler(mockHandler)(request),
      ).rejects.toThrow("Unknown error");
    });
  });
});
