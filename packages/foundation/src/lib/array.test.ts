import { describe, expect, it } from "vitest";

import { all } from "./array";

describe("array", () => {
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
});
