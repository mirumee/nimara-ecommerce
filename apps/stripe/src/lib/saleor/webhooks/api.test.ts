import { describe, expect, it, type Mock, vi } from "vitest";

import { type Logger } from "@nimara/infrastructure/logging/types";

import { responseError } from "@/lib/api/util";
import { MagicMock } from "@/lib/test/mock";
import * as logging from "@/providers/logging";

import { verifySaleorWebhookRoute } from "./api";
import { verifySaleorWebhookSignature } from "./util";

describe("api", () => {
  describe("verifySaleorWebhookRoute", () => {
    vi.mock("./util", () => ({
      verifySaleorWebhookSignature: vi.fn(),
    }));

    vi.mock("@/lib/api/util", () => ({
      responseError: vi.fn(() => new Response("error", { status: 400 })),
    }));

    it("calls handler when verification succeeds", async () => {
      // given
      const pathname = "/webhook";
      const request = new Request(`https://example.com${pathname}`, {
        method: "POST",
        body: JSON.stringify({ event: "test_event" }),
      });
      const mockHandler = vi.fn(async () => new Response("success"));
      const loggerSpy = MagicMock<{ info: Mock }>();

      vi.spyOn(logging, "getLoggingProvider").mockImplementation(
        () => loggerSpy as unknown as Logger,
      );

      (verifySaleorWebhookSignature as Mock).mockResolvedValue({
        headers: { "saleor-api-url": "https://saleor.example.com" },
        errors: null,
        context: null,
      });

      // when
      const result = await verifySaleorWebhookRoute(mockHandler)(request);

      // then
      expect(mockHandler).toHaveBeenCalled();
      expect(result.status).toBe(200);
      expect(loggerSpy.info).toHaveBeenCalledWith(
        `Received Saleor webhook at ${pathname}.`,
      );
    });

    it("returns error response when verification fails", async () => {
      // given
      const pathname = "/webhook";
      const request = new Request(`https://example.com${pathname}`, {
        method: "POST",
        body: JSON.stringify({ event: "test_event" }),
      });
      const mockHandler = vi.fn();
      const loggerSpy = MagicMock<{ info: Mock }>();

      vi.spyOn(logging, "getLoggingProvider").mockImplementation(
        () => loggerSpy as unknown as Logger,
      );
      (verifySaleorWebhookSignature as Mock).mockResolvedValue({
        headers: null,
        errors: [{ message: "Invalid signature" }],
        context: "signature",
      });

      // when
      const result = await verifySaleorWebhookRoute(mockHandler)(request);

      // then
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(400);
      expect(responseError).toHaveBeenCalledWith({
        description: "Saleor webhook verification failed",
        context: "signature",
        errors: [{ message: "Invalid signature" }],
      });
      expect(loggerSpy.info).toHaveBeenCalledWith(
        `Received Saleor webhook at ${pathname}.`,
      );
    });
  });
});
