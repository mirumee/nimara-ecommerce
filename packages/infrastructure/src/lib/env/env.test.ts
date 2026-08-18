import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { readEnv } from "./env";

const schema = z.object({ BAR: z.string(), FOO: z.string() });

describe("env", () => {
  describe("readEnv", () => {
    const original = { ...process.env };

    afterEach(() => {
      process.env = { ...original };
    });

    it("returns the parsed env, stripping unknown keys", () => {
      // given
      process.env.FOO = "a";
      process.env.BAR = "b";

      // when
      const result = readEnv({ schema });

      // then
      expect(result).toEqual({ FOO: "a", BAR: "b" });
    });

    it("throws naming the provider and the offending key", () => {
      // given
      delete process.env.FOO;
      process.env.BAR = "b";

      // when / then
      expect(() => readEnv({ name: "Vercel Edge Config", schema })).toThrow(
        /Invalid Vercel Edge Config env:.*FOO/,
      );
    });

    it("falls back to a default name", () => {
      // given
      delete process.env.FOO;
      delete process.env.BAR;

      // when / then
      expect(() => readEnv({ schema })).toThrow(/Invalid environment env:/);
    });
  });
});
