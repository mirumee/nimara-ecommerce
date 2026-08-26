import { describe, expect, it } from "vitest";

import { err, ok } from "@nimara/domain/objects/Result";

import { toClientResult } from "./to-client-result";

describe("toClientResult", () => {
  it("strips message, status and context, keeping only the code", () => {
    const result = toClientResult(
      err([
        {
          code: "NEWSLETTER_SUBSCRIBE_ERROR",
          message: "Klaviyo answered 404.",
          status: 404,
          context: { listId: "ABC123" },
        },
      ]),
    );

    expect(result).toEqual({
      ok: false,
      errors: [{ code: "NEWSLETTER_SUBSCRIBE_ERROR" }],
    });
  });

  it("keeps field alongside code for a field-level error", () => {
    const result = toClientResult(
      err([{ code: "INVALID_VALUE_ERROR", field: "email" }]),
    );

    expect(result).toEqual({
      ok: false,
      errors: [{ code: "INVALID_VALUE_ERROR", field: "email" }],
    });
  });

  it("maps a multi-error array element-wise and keeps it non-empty", () => {
    const result = toClientResult(
      err([
        { code: "INVALID_VALUE_ERROR", field: "email", message: "bad" },
        { code: "NEWSLETTER_SUBSCRIBE_ERROR", status: 500 },
      ]),
    );

    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error("expected an error result");
    }

    expect(result.errors).toHaveLength(2);
    expect(result.errors).toEqual([
      { code: "INVALID_VALUE_ERROR", field: "email" },
      { code: "NEWSLETTER_SUBSCRIBE_ERROR" },
    ]);
  });

  it("passes an ok result through untouched", () => {
    const okResult = ok({ acknowledged: true as const });

    expect(toClientResult(okResult)).toBe(okResult);
  });
});
