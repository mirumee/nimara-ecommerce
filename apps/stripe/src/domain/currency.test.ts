import { describe, expect, it } from "vitest";

import {
  getAmountFromCents,
  getCentsFromAmount,
  getDecimalsForStripe,
} from "./currency";

describe("currency", () => {
  it.each([
    { currency: "USD", decimals: 2 },
    { currency: "BIF", decimals: 0 },
    { currency: "BHD", decimals: 3 },
  ])(`getDecimalsForStripe > $currency`, ({ currency, decimals }) => {
    // Given
    const expectedDecimals = getDecimalsForStripe(currency);

    // When & Then
    expect(expectedDecimals).toEqual(decimals);
  });

  it.each([
    { currency: "CHF", amount: 944, output: 94400 },
    { currency: "CHF", amount: 944.4, output: 94440 },
    { currency: "CHF", amount: 944.44, output: 94444 },
    { currency: "CHF", amount: 944.99, output: 94499 },
    // Three decimals
    { currency: "BHD", amount: 499, output: 499000 },
    { currency: "BHD", amount: 499.44, output: 499440 },
    { currency: "BHD", amount: 499.444, output: 499444 },
    { currency: "BHD", amount: 499.999, output: 499999 },
    // No decimals
    { currency: "JPY", amount: 499, output: 499 },
    { currency: "JPY", amount: 499.0, output: 499 },
  ])(`getCentsFromAmount > $currency`, ({ currency, amount, output }) => {
    // Given
    const expectedAmount = getCentsFromAmount({ currency, amount });

    // When & Then
    expect(expectedAmount).toEqual(output);
  });

  it.each([
    { currency: "CHF", amount: 94400, output: "944.00" },
    { currency: "CHF", amount: 94440, output: "944.40" },
    { currency: "CHF", amount: 94444, output: "944.44" },
    { currency: "CHF", amount: 94499, output: "944.99" },
    // Three decimals
    { currency: "BHD", amount: 499000, output: "499.000" },
    { currency: "BHD", amount: 499440, output: "499.440" },
    { currency: "BHD", amount: 499444, output: "499.444" },
    { currency: "BHD", amount: 499999, output: "499.999" },
    // No decimals
    { currency: "JPY", amount: 499, output: "499" },
  ])(`getAmountFromCents > $currency`, ({ currency, amount, output }) => {
    // Given
    const expectedAmount = getAmountFromCents({ currency, amount });

    // When & Then
    expect(expectedAmount).toEqual(output);
  });
});
