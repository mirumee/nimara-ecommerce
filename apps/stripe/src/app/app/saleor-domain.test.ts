import { describe, expect, it } from "vitest";

import { getSaleorDomainFromApiUrl } from "./saleor-domain";

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
