import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRemoteJWKSetMock, flattenedVerifyMock } = vi.hoisted(() => ({
  createRemoteJWKSetMock: vi.fn(),
  flattenedVerifyMock: vi.fn(),
}));

vi.mock("jose", () => ({
  createRemoteJWKSet: createRemoteJWKSetMock,
  flattenedVerify: flattenedVerifyMock,
}));

import { verifySaleorWebhookSignature } from "./webhook-signature";

describe("verifySaleorWebhookSignature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createRemoteJWKSetMock.mockReturnValue(vi.fn());
    flattenedVerifyMock.mockResolvedValue({});
  });

  it("returns success for valid signature and headers", async () => {
    const result = await verifySaleorWebhookSignature({
      headers: new Headers({
        "saleor-domain": "localhost:8000",
        "saleor-api-url": "http://localhost:8000/graphql/",
        "saleor-signature": "protected..signature",
      }),
      payload: '{"event":{}}',
    });

    expect(result.success).toBe(true);
  });

  it("returns validation error for invalid headers", async () => {
    const result = await verifySaleorWebhookSignature({
      headers: new Headers({
        "saleor-domain": "localhost:8000",
      }),
      payload: '{"event":{}}',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid Saleor webhook headers.");
    }
  });

  it("returns signature error when verification fails", async () => {
    flattenedVerifyMock.mockRejectedValue(new Error("invalid signature"));

    const result = await verifySaleorWebhookSignature({
      headers: new Headers({
        "saleor-domain": "localhost:8000",
        "saleor-api-url": "http://localhost:8000/graphql/",
        "saleor-signature": "protected..signature",
      }),
      payload: '{"event":{}}',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Invalid Saleor webhook signature.");
    }
  });
});
