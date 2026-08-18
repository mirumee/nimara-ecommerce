import { describe, expect, it } from "vitest";

import { getExpandableId, mapSetupIntentStatusToProcessResult } from "./utils";

describe("utils", () => {
  describe("getExpandableId", () => {
    it.each([
      { value: "pm_1", expected: "pm_1" },
      { value: { id: "pm_2" }, expected: "pm_2" },
      { value: null, expected: null },
      { value: undefined, expected: null },
    ])("should resolve $value to $expected", ({ value, expected }) => {
      // when / then
      expect(getExpandableId(value)).toBe(expected);
    });
  });

  describe("mapSetupIntentStatusToProcessResult", () => {
    it.each([
      { status: "succeeded", expected: "SUCCESSFULLY_TOKENIZED" },
      { status: "processing", expected: "PENDING" },
      { status: "requires_action", expected: "ADDITIONAL_ACTION_REQUIRED" },
      {
        status: "requires_confirmation",
        expected: "ADDITIONAL_ACTION_REQUIRED",
      },
      { status: "requires_payment_method", expected: "FAILED_TO_TOKENIZE" },
      { status: "canceled", expected: "FAILED_TO_TOKENIZE" },
    ] as const)("should map $status to $expected", ({ status, expected }) => {
      // when / then
      expect(mapSetupIntentStatusToProcessResult(status)).toBe(expected);
    });
  });
});
