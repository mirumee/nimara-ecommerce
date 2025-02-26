import { describe, expect, it } from "vitest";

import { isError } from "./error"; // Adjust import as needed

class CustomError extends Error {}

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
});
