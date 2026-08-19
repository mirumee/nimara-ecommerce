import { describe, expect, it } from "vitest";

import { baseConfigSchema } from "./schema";

const parseBasePath = (BASE_PATH?: string) =>
  baseConfigSchema.safeParse({
    ENVIRONMENT: "TEST",
    ...(BASE_PATH === undefined ? {} : { BASE_PATH }),
  });

describe("baseConfigSchema", () => {
  describe("BASE_PATH", () => {
    it.each(["", "/stripe", "/apps/stripe"])("accepts %o", (value) => {
      // when
      const result = parseBasePath(value);

      // then
      expect(result.success).toBe(true);
    });

    it("defaults to root when unset", () => {
      // when
      const result = parseBasePath();

      // then
      expect(result.success && result.data.BASE_PATH).toBe("");
    });

    it.each([
      ["/", "a bare slash — doubles the separator"],
      ["/stripe/", "a trailing slash"],
      ["stripe", "a missing leading slash"],
      ["//stripe", "an empty leading segment"],
    ])("rejects %o (%s)", (value) => {
      // when
      const result = parseBasePath(value);

      // then
      expect(result.success).toBe(false);
    });

    it("explains how to correct the value", () => {
      // when
      const result = parseBasePath("/");

      // then
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain("`/stripe`");
    });
  });
});
