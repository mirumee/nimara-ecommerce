import { describe, expect, it } from "vitest";

import {
  mergeVendorCustomerIds,
  parseVendorCustomerIds,
  serializeVendorCustomerIds,
} from "./customer-ids";

describe("customer-ids helpers", () => {
  it("parses valid json array", () => {
    expect(parseVendorCustomerIds('["c-1","c-2"]')).toEqual(["c-1", "c-2"]);
  });

  it("returns empty list for invalid payload", () => {
    expect(parseVendorCustomerIds("not-json")).toEqual([]);
    expect(parseVendorCustomerIds('{"foo":"bar"}')).toEqual([]);
  });

  it("serializes unique sorted ids", () => {
    expect(serializeVendorCustomerIds(["c-2", "c-1", "c-1", ""])).toBe(
      '["c-1","c-2"]',
    );
  });

  it("merges ids without duplicates", () => {
    const result = mergeVendorCustomerIds('["c-1"]', "c-2");

    expect(result.changed).toBe(true);
    expect(result.value).toBe('["c-1","c-2"]');
  });

  it("returns unchanged for existing id", () => {
    const result = mergeVendorCustomerIds('["c-1","c-2"]', "c-2");

    expect(result.changed).toBe(false);
    expect(result.value).toBe('["c-1","c-2"]');
  });
});
