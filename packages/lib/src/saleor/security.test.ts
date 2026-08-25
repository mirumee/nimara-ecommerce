import { describe, expect, it } from "vitest";

import { isDomainAllowed } from "./security";

describe("security", () => {
  describe("isDomainAllowed", () => {
    it("allows an exact match (case-insensitive)", () => {
      expect(
        isDomainAllowed({
          domain: "Store.EU.saleor.cloud",
          allowedDomains: ["store.eu.saleor.cloud"],
        }),
      ).toBe(true);
    });

    it("allows a wildcard match", () => {
      expect(
        isDomainAllowed({
          domain: "store.eu.saleor.cloud",
          allowedDomains: ["*.eu.saleor.cloud"],
        }),
      ).toBe(true);
    });

    it("allows any domain with `*`", () => {
      expect(
        isDomainAllowed({
          domain: "anything.example.com",
          allowedDomains: ["*"],
        }),
      ).toBe(true);
    });

    it("rejects a non-matching domain", () => {
      expect(
        isDomainAllowed({
          domain: "evil.example.com",
          allowedDomains: ["store.eu.saleor.cloud"],
        }),
      ).toBe(false);
    });

    it("rejects when the allowlist is empty", () => {
      expect(
        isDomainAllowed({
          domain: "store.eu.saleor.cloud",
          allowedDomains: [],
        }),
      ).toBe(false);
    });

    it("does not let a wildcard dot match across labels", () => {
      expect(
        isDomainAllowed({
          domain: "store.eu.saleor.cloud.evil.com",
          allowedDomains: ["*.saleor.cloud"],
        }),
      ).toBe(false);
    });
  });
});
