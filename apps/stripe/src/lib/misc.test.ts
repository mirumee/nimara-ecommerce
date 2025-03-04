import { describe, expect, it } from "vitest";

import { all, any, isEmptyObject, isObject } from "./misc";

describe("misc", () => {
  describe("isObject", () => {
    it("returns true for objects", () => {
      // given
      const obj = {};
      const objWithProps = { key: "value" };

      // when
      const result1 = isObject(obj);
      const result2 = isObject(objWithProps);

      // then
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it("returns false for non-objects", () => {
      // given
      const arr: unknown[] = [];
      const date = new Date();
      const nullValue = null as unknown as object;
      const undefinedValue = undefined as unknown as object;

      // when
      const result1 = isObject(arr);
      const result2 = isObject(date);
      const result3 = isObject(nullValue);
      const result4 = isObject(undefinedValue);

      // then
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(result4).toBe(false);
    });
  });

  describe("isEmptyObject", () => {
    it("returns true for empty objects", () => {
      // given
      const obj = {};

      // when
      const result = isEmptyObject(obj);

      // then
      expect(result).toBe(true);
    });

    it("returns false for non-empty objects", () => {
      // given
      const obj = { key: "value" };

      // when
      const result = isEmptyObject(obj);

      // then
      expect(result).toBe(false);
    });
  });

  describe("all", () => {
    it("returns true when all values are defined", () => {
      // given
      const values1 = [1, 2, 3];
      const values2 = ["a", "b", "c"];

      // when
      const result1 = all(values1);
      const result2 = all(values2);

      // then
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it("returns false when any value is null or undefined", () => {
      // given
      const values1 = [1, null, 3];
      const values2 = ["a", undefined, "c"];

      // when
      const result1 = all(values1);
      const result2 = all(values2);

      // then
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it("returns true for an empty array", () => {
      // given
      const values: number[] = [];

      // when
      const result = all(values);

      // then
      expect(result).toBe(true);
    });
  });

  describe("any", () => {
    it("returns true when at least one value is defined", () => {
      // given
      const values1 = [1, null, 3];
      const values2 = ["a", undefined, "c"];

      // when
      const result1 = any(values1);
      const result2 = any(values2);

      // then
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it("returns false when all values are null or undefined", () => {
      // given
      const values = [null, undefined, null];

      // when
      const result = any(values);

      // then
      expect(result).toBe(false);
    });

    it("returns false for an empty array", () => {
      // given
      const values: number[] = [];

      // when
      const result = any(values);

      // then
      expect(result).toBe(false);
    });
  });
});
