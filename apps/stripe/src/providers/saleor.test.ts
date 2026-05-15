import { beforeEach, describe, expect, it, vi } from "vitest";

import { saleorClient } from "@/lib/saleor/client";

import { getSaleorClient } from "./saleor";

vi.mock("@/lib/saleor/client", () => ({
  saleorClient: vi.fn(() => ({ execute: vi.fn() })),
}));

describe("getSaleorClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts a full Saleor API URL from AppBridge", () => {
    getSaleorClient({
      saleorDomain: "https://demo.nimara.store/graphql",
      authToken: "token",
    });

    expect(saleorClient).toHaveBeenCalledWith(
      expect.objectContaining({
        authToken: "token",
        saleorUrl: "https://demo.nimara.store",
        timeout: 10000,
      }),
    );
  });

  it("accepts a host-only Saleor domain from Saleor headers", () => {
    getSaleorClient({
      saleorDomain: "demo.nimara.store",
      authToken: "token",
    });

    expect(saleorClient).toHaveBeenCalledWith(
      expect.objectContaining({
        authToken: "token",
        saleorUrl: "https://demo.nimara.store",
        timeout: 10000,
      }),
    );
  });

  it("rejects a different Saleor tenant", () => {
    expect(() =>
      getSaleorClient({
        saleorDomain: "https://other.example.com/graphql",
        authToken: "token",
      }),
    ).toThrow("Saleor domain/url mismatch!");
  });
});
