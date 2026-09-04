import { describe, expect, it } from "vitest";
import { z } from "zod";

import { blankAsUnset, prepareConfig } from "./util";

describe("utils", () => {
  describe("blankAsUnset", () => {
    it("reads a blank variable as unset", () => {
      // given `SENTRY_DSN=` is how an example file documents an optional one
      const schema = z.object({ SENTRY_DSN: blankAsUnset(z.url().optional()) });

      // when
      const result = schema.parse({ SENTRY_DSN: "" });

      // then an empty string is not a URL, and it must not fail the parse.
      expect(result.SENTRY_DSN).toBeUndefined();
    });

    it("reads a whitespace-only variable as unset", () => {
      // given
      const schema = z.object({ SENTRY_DSN: blankAsUnset(z.url().optional()) });

      // when / then a line carrying nothing but spaces says the same thing.
      expect(schema.parse({ SENTRY_DSN: "  " }).SENTRY_DSN).toBeUndefined();
    });

    it("lets a blank variable fall back to its default", () => {
      // given
      const schema = z.object({
        CONFIG_KEY: blankAsUnset(z.string().default("nimara-config")),
      });

      // when
      const result = schema.parse({ CONFIG_KEY: "" });

      // then an empty string would otherwise shadow the default.
      expect(result.CONFIG_KEY).toBe("nimara-config");
    });

    it("still rejects a value the schema refuses", () => {
      // given
      const schema = z.object({ SENTRY_DSN: blankAsUnset(z.url().optional()) });

      // when / then blank is the only value it forgives.
      expect(() => schema.parse({ SENTRY_DSN: "not a url" })).toThrow();
    });
  });

  describe("prepareConfig", () => {
    it("should return parsed config for valid input", () => {
      // given
      const schema = z.object({
        key: z.string(),
      });
      const input = { key: "value" };

      // when
      const result = prepareConfig({ schema, input });

      // then
      expect(result).toEqual({ key: "value" });
    });

    it("should return parsed config from process.env", () => {
      // given
      const schema = z.object({
        ENV_KEY: z.string(),
      });

      process.env.ENV_KEY = "env_value";

      // when
      const result = prepareConfig({ schema });

      // then
      expect(result).toEqual({ ENV_KEY: "env_value" });
    });

    it("should throw an error for invalid input", () => {
      // given
      const schema = z.object({
        key: z.string(),
      });
      const input = { key: 123 }; // Invalid input (number instead of string)

      // when / then
      expect(() =>
        prepareConfig({ schema, input, name: "TestConfig" }),
      ).toThrow(
        "Invalid TestConfig CONFIG\n\nkey: Invalid input: expected string, received number",
      );
    });

    it("should return empty object when serverOnly is true and window is defined", () => {
      // given
      const schema = z.object({
        key: z.string(),
      });
      const input = { key: "value" };

      global.window = {} as any; // Simulate client-side environment

      // when
      const result = prepareConfig({ schema, input, serverOnly: true });

      // then
      expect(result).toEqual({});

      // @ts-expect-error reset window
      delete global.window; // Clean up global window after test
    });

    it("should throw an error with multiple validation issues", () => {
      // given
      const schema = z.object({
        key1: z.string(),
        key2: z.number(),
      });
      const input = { key1: 123, key2: "invalid" }; // Both are invalid

      // when / then
      expect(() =>
        prepareConfig({ schema, input, name: "MultiErrorConfig" }),
      ).toThrow(
        "Invalid MultiErrorConfig CONFIG\n\nkey1: Invalid input: expected string, received number\nkey2: Invalid input: expected number, received string",
      );
    });

    it("should merge process.env and input values", () => {
      // given
      process.env.ENV_KEY = "env_value";
      const schema = z.object({
        ENV_KEY: z.string(),
        inputKey: z.string(),
      });
      const input = { inputKey: "input_value" };

      // when
      const result = prepareConfig({ schema, input });

      // then
      expect(result).toEqual({
        ENV_KEY: "env_value",
        inputKey: "input_value",
      });
    });
  });
});
