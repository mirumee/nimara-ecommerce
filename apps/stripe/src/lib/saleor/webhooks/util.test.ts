import { describe, expect, it, type Mock, vi } from "vitest";

import { verifyWebhookSignature } from "../auth/jwt";
import { saleorWebhookHeaders } from "../headers";
import { verifySaleorWebhookSignature } from "./util";

describe("util", () => {
  describe("verifySaleorWebhookSignature", () => {
    vi.mock("@/providers/jwks", () => ({
      getJWKSProvider: vi.fn(() => ({})),
    }));

    vi.mock("../auth/jwt", () => ({
      verifyWebhookSignature: vi.fn(),
    }));

    vi.mock("../headers", () => ({
      saleorWebhookHeaders: {
        safeParse: vi.fn(),
      },
    }));

    it("returns headers when signature verification succeeds", async () => {
      // given
      const data = {
        "saleor-signature": "valid_signature",
        "saleor-api-url": "https://saleor.example.com",
      };
      const headers = new Headers(data);

      (saleorWebhookHeaders.safeParse as Mock).mockReturnValue({
        success: true,
        data,
      });

      // when
      const result = await verifySaleorWebhookSignature({
        headers,
        payload: "test_payload",
      });

      // then
      expect(result.headers).toEqual(data);
      expect(result.errors).toBeNull();
    });

    it("returns error when headers validation fails", async () => {
      // given
      const errors = [{ message: "Invalid headers" }];

      (saleorWebhookHeaders.safeParse as Mock).mockReturnValue({
        success: false,
        error: { errors },
      });

      const headers = new Headers();

      // when
      const result = await verifySaleorWebhookSignature({
        headers,
        payload: "test_payload",
      });

      // then
      expect(result.headers).toBeNull();
      expect(result.errors).toEqual(errors);
    });

    it("returns error when signature verification fails", async () => {
      // given
      const data = {
        "saleor-signature": "invalid_signature",
        "saleor-api-url": "https://saleor.example.com",
      };
      const headers = new Headers(data);

      (saleorWebhookHeaders.safeParse as Mock).mockReturnValue({
        success: true,
        data: data,
      });
      (verifyWebhookSignature as Mock).mockImplementation(() => {
        throw new Error("Signature verification failed");
      });

      // when
      const result = await verifySaleorWebhookSignature({
        headers,
        payload: "test_payload",
      });

      // then
      expect(result.headers).toBeNull();
      expect(result.context).toEqual("signature");
      expect(result.errors).toEqual([
        { message: "Signature verification failed" },
      ]);
    });
  });
});
