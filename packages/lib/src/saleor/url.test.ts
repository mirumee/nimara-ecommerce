import { describe, expect, it } from "vitest";

import { saleorDomainFromApiUrl, saleorUrlFromDomain } from "./url";

describe("url", () => {
  describe("saleorDomainFromApiUrl", () => {
    it("extracts the Saleor host from an AppBridge API URL", () => {
      expect(saleorDomainFromApiUrl("https://demo.nimara.store/graphql/")).toBe(
        "demo.nimara.store",
      );
    });

    it("preserves a port in a local Saleor API URL", () => {
      expect(saleorDomainFromApiUrl("http://localhost:8000/graphql/")).toBe(
        "localhost:8000",
      );
    });
  });

  describe("saleorUrlFromDomain", () => {
    it("uses http for a local domain", () => {
      expect(saleorUrlFromDomain("localhost:8000")).toBe(
        "http://localhost:8000",
      );
    });

    it("uses https for a remote domain", () => {
      expect(saleorUrlFromDomain("demo.nimara.store")).toBe(
        "https://demo.nimara.store",
      );
    });
  });
});
