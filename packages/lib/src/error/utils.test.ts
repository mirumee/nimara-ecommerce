import { describe, expect, it } from "vitest";

import { expectError, isError, serializeError } from "./utils";

class CustomError extends Error {}
class OtherError extends Error {}

describe("error utils", () => {
  describe("isError", () => {
    it("returns true for an instance of Error", () => {
      // given
      const error = new Error("Test error");

      // when
      const result = isError(error);

      // then
      expect(result).toBe(true);
    });

    it("returns false for a non-error value", () => {
      // given
      const value = "not an error";

      // when
      const result = isError(value);

      // then
      expect(result).toBe(false);
    });

    it("returns true for an instance of a custom error class", () => {
      // given
      const error = new CustomError("Custom error");

      // when
      const result = isError(error);

      // then
      expect(result).toBe(true);
    });

    it("returns true for an instance of a specific error class when provided", () => {
      // given
      const error = new CustomError("Custom error");

      // when
      const result = isError(error, CustomError);

      // then
      expect(result).toBe(true);
    });

    it("returns false for an error instance that does not match the provided class", () => {
      // given
      const error = new Error("General error");

      // when
      const result = isError(error, CustomError);

      // then
      expect(result).toBe(false);
    });

    it("matches any class in a list", () => {
      // given
      const error = new OtherError("Other error");

      // when
      const result = isError(error, [CustomError, OtherError]);

      // then
      expect(result).toBe(true);
    });
  });

  describe("expectError", () => {
    it("narrows an error it was told to expect", () => {
      // given
      const error = new CustomError("Custom error");

      // when
      const result = expectError(error, [CustomError, OtherError]);

      // then
      expect(result).toBe(true);
    });

    it("rethrows what it was not told to expect", () => {
      // given
      const error = new Error("General error");

      // when
      const act = () => expectError(error, CustomError);

      // then the original error travels on, not a wrapper.
      expect(act).toThrow(error);
    });
  });

  describe("serializeError", () => {
    it("keeps a nested cause readable", () => {
      // given
      const error = new Error("Outer", { cause: new Error("Inner") });

      // when
      const result = serializeError(error);

      // then a `cause` chain survives, where JSON.stringify would drop it.
      expect(result).toMatchObject({
        cause: { message: "Inner", name: "Error" },
        message: "Outer",
      });
    });

    it("describes a thrown non-error", () => {
      // when
      const result = serializeError("boom");

      // then
      expect(result).toEqual({ message: "boom", name: "string" });
    });
  });
});
