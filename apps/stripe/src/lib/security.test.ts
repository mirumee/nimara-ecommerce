import { describe, expect, it } from "vitest";

import { maskString } from "./security"; // Adjust import as needed

describe("maskString", () => {
  it("masks a string with default settings", () => {
    // given
    const str = "1234567890";

    // when
    const result = maskString({ str });

    // then
    expect(result).toBe("*****67890");
  });

  it("masks a string with a custom mask character", () => {
    // given
    const str = "abcdefghij";
    const maskChar = "#";

    // when
    const result = maskString({ str, maskChar });

    // then
    expect(result).toBe("#####fghij");
  });

  it("masks a string with a custom number of visible characters", () => {
    // given
    const str = "abcdefghij";
    const visibleChars = 3;

    // when
    const result = maskString({ str, visibleChars });

    // then
    expect(result).toBe("*******hij");
  });

  it("returns the original string if visibleChars is equal to or greater than the string length", () => {
    // given
    const str = "abcdef";
    const visibleChars = 6;

    // when
    const result = maskString({ str, visibleChars });

    // then
    expect(result).toBe("abcdef");
  });

  it("returns a fully masked string except the last visible character", () => {
    // given
    const str = "abcde";
    const visibleChars = 1;

    // when
    const result = maskString({ str, visibleChars });

    // then
    expect(result).toBe("****e");
  });

  it("returns only mask characters when visibleChars is zero", () => {
    // given
    const str = "abcdef";
    const visibleChars = 0;

    // when
    const result = maskString({ str, visibleChars });

    // then
    expect(result).toBe("******");
  });
});
