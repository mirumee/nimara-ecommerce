import { describe, expect, it } from "vitest";

import { getSaleorDomainFromApiUrl, isDomainAllowed } from "./util";

describe("getSaleorDomainFromApiUrl", () => {
  it("extracts the Saleor host from an AppBridge API URL", () => {
    expect(
      getSaleorDomainFromApiUrl("https://demo.nimara.store/graphql/"),
    ).toBe("demo.nimara.store");
  });

  it("preserves a port in a local Saleor API URL", () => {
    expect(getSaleorDomainFromApiUrl("http://localhost:8000/graphql/")).toBe(
      "localhost:8000",
    );
  });
});

describe("isDomainAllowed", () => {
  it("allows an exactly matching domain", () => {
    expect(
      isDomainAllowed({
        domain: "demo.nimara.store",
        allowedDomains: ["other.saleor.cloud", "demo.nimara.store"],
      }),
    ).toBe(true);
  });

  it("ignores casing", () => {
    expect(
      isDomainAllowed({
        domain: "Demo.Nimara.Store",
        allowedDomains: ["demo.nimara.store"],
      }),
    ).toBe(true);
  });

  it("allows a domain matching a wildcard pattern", () => {
    expect(
      isDomainAllowed({
        domain: "store.eu.saleor.cloud",
        allowedDomains: ["*.saleor.cloud"],
      }),
    ).toBe(true);
  });

  it("allows any domain for the catch all pattern", () => {
    expect(
      isDomainAllowed({ domain: "store.example.com", allowedDomains: ["*"] }),
    ).toBe(true);
  });

  it("rejects a domain outside the wildcard pattern", () => {
    expect(
      isDomainAllowed({
        domain: "saleor.cloud.evil.com",
        allowedDomains: ["*.saleor.cloud"],
      }),
    ).toBe(false);
  });

  it("rejects an unlisted domain", () => {
    expect(
      isDomainAllowed({
        domain: "evil.example.com",
        allowedDomains: ["demo.nimara.store"],
      }),
    ).toBe(false);
  });

  it("rejects when nothing is allowed", () => {
    expect(
      isDomainAllowed({ domain: "demo.nimara.store", allowedDomains: [] }),
    ).toBe(false);
  });

  describe("prefixed cloud pattern", () => {
    const allowedDomains = ["nimara-*.eu.saleor.cloud"];

    it.each([
      ["nimara-demo.eu.saleor.cloud", true],
      ["NIMARA-Demo.eu.saleor.cloud", true],
      /**
       * `*` expands to `.*`, so it spans dots and matches nothing at all. Both
       * stay under the pinned suffix, which is what the pattern guards.
       */
      ["nimara-a.b.eu.saleor.cloud", true],
      ["nimara-.eu.saleor.cloud", true],
      ["demo.eu.saleor.cloud", false],
      ["nimara-demo.us.saleor.cloud", false],
      ["nimara-demo.eu.saleor.cloud.evil.com", false],
    ])("matches %s: %s", (domain, expected) => {
      expect(isDomainAllowed({ domain, allowedDomains })).toBe(expected);
    });
  });
});
