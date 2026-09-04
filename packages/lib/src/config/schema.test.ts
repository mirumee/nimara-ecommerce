import { describe, expect, it } from "vitest";
import { z } from "zod";

import { baseConfigSchema } from "./schema";

const PKG = {
  author: "Nimara",
  description: "Test app",
  name: "@nimara/feed-generator",
  version: "1.2.3",
};

const parse = (env: Record<string, unknown>) =>
  baseConfigSchema(PKG).parse({ ENVIRONMENT: "test", ...env });

describe("schema", () => {
  describe("baseConfigSchema", () => {
    it("derives the app's identity from its package.json", () => {
      // when
      const config = parse({});

      // then
      expect(config).toMatchObject({
        AUTHOR: "Nimara",
        DESCRIPTION: "Test app",
        DISPLAY_NAME: "Feed generator",
        NAME: "@nimara/feed-generator",
        RELEASE: "@nimara/feed-generator@1.2.3",
        VERSION: "1.2.3",
      });
    });

    it("flags the environment it runs in", () => {
      // when / then
      expect(parse({ NODE_ENV: "production" })).toMatchObject({
        IS_DEVELOPMENT: false,
        IS_PRODUCTION: true,
        IS_TEST: false,
      });
    });

    describe("ALLOWED_DOMAINS", () => {
      it("splits the comma-separated list off the environment", () => {
        // when / then
        expect(
          parse({ ALLOWED_DOMAINS: "a.example.com, B.example.com ,," })
            .ALLOWED_DOMAINS,
        ).toEqual(["a.example.com", "b.example.com"]);
      });

      it.each([{ ALLOWED_DOMAINS: "" }, {}])(
        "allows no domain when given %o",
        (env) => {
          // when / then
          expect(parse(env).ALLOWED_DOMAINS).toEqual([]);
        },
      );

      it("takes a list as given, for a config not read from the environment", () => {
        // when / then
        expect(
          parse({ ALLOWED_DOMAINS: ["a.example.com"] }).ALLOWED_DOMAINS,
        ).toEqual(["a.example.com"]);
      });
    });

    describe("optionals", () => {
      it.each(["SENTRY_DSN", "VITE_SALEOR_APP_TOKEN"])(
        "reads an absent %s as unset",
        (key) => {
          // when / then
          expect(parse({})[key as "SENTRY_DSN"]).toBeUndefined();
        },
      );

      it.each([
        ["blank", ""],
        ["whitespace", "  "],
      ])("refuses a %s value instead of reading it as unset", (_, value) => {
        // given a half-finished `.env`, not a variable left out

        // when / then
        for (const key of ["SENTRY_DSN", "VITE_SALEOR_APP_TOKEN"]) {
          expect(
            baseConfigSchema(PKG).safeParse({
              ENVIRONMENT: "test",
              [key]: value,
            }).success,
          ).toBe(false);
        }
      });

      it("trims a value pasted with its whitespace", () => {
        // when / then
        expect(
          parse({ SENTRY_DSN: " https://key@o1.ingest.sentry.io/2 " })
            .SENTRY_DSN,
        ).toBe("https://key@o1.ingest.sentry.io/2");
      });
    });

    describe("SENTRY_DSN", () => {
      it("refuses a DSN that is not a URL", () => {
        // given a value Sentry would swallow by disabling itself

        // when
        const result = baseConfigSchema(PKG).safeParse({
          ENVIRONMENT: "test",
          SENTRY_DSN: "o1.ingest.sentry.io/2",
        });

        // then
        expect(result.success).toBe(false);
      });
    });

    describe("VITE_SALEOR_APP_TOKEN", () => {
      it("refuses the development token in production", () => {
        // when
        const result = baseConfigSchema(PKG).safeParse({
          ENVIRONMENT: "production",
          NODE_ENV: "production",
          VITE_SALEOR_APP_TOKEN: "token",
        });

        // then
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toContain(
          "must not be set in production",
        );
      });

      it("allows it outside production", () => {
        // when / then
        expect(
          parse({ NODE_ENV: "development", VITE_SALEOR_APP_TOKEN: "token" })
            .VITE_SALEOR_APP_TOKEN,
        ).toBe("token");
      });
    });

    it("composes with an app's own fields", () => {
      // given the shape every app builds its config with
      const schema = z
        .object({ CONFIG_KEY: z.string().default("nimara-config") })
        .and(baseConfigSchema(PKG));

      // when / then
      expect(schema.parse({ ENVIRONMENT: "test" })).toMatchObject({
        CONFIG_KEY: "nimara-config",
        DISPLAY_NAME: "Feed generator",
      });
    });
  });
});
