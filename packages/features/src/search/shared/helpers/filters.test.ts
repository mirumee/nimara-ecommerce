import { describe, expect, it } from "vitest";

import { type SearchParams } from "../types";
import { getFiltersFromSearchParams } from "./filters";

describe("PLP - getFiltersFromSearchParams", () => {
  it("should keep params that narrow the result set", () => {
    const searchParams: SearchParams = {
      color: "red",
      size: "m",
      "is-exclusive": "true",
    };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({
      color: "red",
      size: "m",
      "is-exclusive": "true",
    });
  });

  it("should strip pass-through params", () => {
    const searchParams: SearchParams = {
      q: "shirt",
      sortBy: "price-asc",
      limit: "24",
      color: "red",
    };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({ color: "red" });
  });

  it("should strip pagination params", () => {
    const searchParams: SearchParams = {
      page: "2",
      after: "abc",
      before: "xyz",
      color: "red",
    };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({ color: "red" });
  });

  it("should keep category and collection as filters", () => {
    const searchParams: SearchParams = {
      category: "hoodies",
      collection: "summer-sale",
    };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({
      category: "hoodies",
      collection: "summer-sale",
    });
  });

  it("should drop params with an undefined value", () => {
    const searchParams: SearchParams = { color: undefined, size: "m" };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({ size: "m" });
  });

  it("should keep params with an empty value", () => {
    const searchParams: SearchParams = { color: "" };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({ color: "" });
  });

  it("should preserve multi-value filters verbatim", () => {
    const searchParams: SearchParams = {
      color: "red,green",
      material: "cotton.wool",
    };

    expect(getFiltersFromSearchParams(searchParams)).toEqual({
      color: "red,green",
      material: "cotton.wool",
    });
  });

  it("should return an empty object when no filters are applied", () => {
    expect(getFiltersFromSearchParams({})).toEqual({});
    expect(
      getFiltersFromSearchParams({ sortBy: "price-asc", page: "3" }),
    ).toEqual({});
  });

  it("should not mutate the passed search params", () => {
    const searchParams: SearchParams = { sortBy: "price-asc", color: "red" };

    getFiltersFromSearchParams(searchParams);

    expect(searchParams).toEqual({ sortBy: "price-asc", color: "red" });
  });
});
