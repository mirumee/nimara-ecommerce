import { describe, expect, it } from "vitest";

import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

import { configFormSchema } from "./config-form-schema";

const STORED_MASK = "*********************4242";

const values = ({
  overrideSecretKey,
  secretKey,
}: {
  overrideSecretKey?: string;
  secretKey: string;
}) => ({
  channelOverrides:
    overrideSecretKey === undefined
      ? {}
      : { eu: { publicKey: "pk_eu", secretKey: overrideSecretKey } },
  default: { publicKey: "pk_default", secretKey },
  defaultChannelSlug: "default-channel",
});

const config = (stored: Partial<ConfigFormData["config"]>) =>
  ({
    channelOverrides: {},
    default: null,
    defaultChannelSlug: "default-channel",
    ...stored,
  }) as ConfigFormData["config"];

const secretKeyIssues = (result: {
  error?: { issues: { path: PropertyKey[] }[] };
}) => (result.error?.issues ?? []).map(({ path }) => path.join("."));

describe("config-form-schema", () => {
  describe("configFormSchema", () => {
    it("requires a secret key when the channel has none stored", () => {
      // given
      const schema = configFormSchema(config({ default: null }));

      // when
      const result = schema.safeParse(values({ secretKey: "" }));

      // then
      expect(secretKeyIssues(result)).toContain("default.secretKey");
    });

    // Blank means "keep the stored key", so it is only an error without one.
    it("accepts a blank secret key when one is stored", () => {
      // given
      const schema = configFormSchema(
        config({
          default: { publicKey: "pk_default", secretKey: STORED_MASK },
        }),
      );

      // when
      const result = schema.safeParse(values({ secretKey: "" }));

      // then
      expect(result.success).toBe(true);
    });

    it("requires a secret key on a freshly added override", () => {
      // given
      const schema = configFormSchema(
        config({
          default: { publicKey: "pk_default", secretKey: STORED_MASK },
        }),
      );

      // when
      const result = schema.safeParse(
        values({ secretKey: "", overrideSecretKey: "" }),
      );

      // then
      expect(secretKeyIssues(result)).toContain(
        "channelOverrides.eu.secretKey",
      );
    });

    it("accepts a blank override secret key when that override has one stored", () => {
      // given
      const schema = configFormSchema(
        config({
          channelOverrides: {
            eu: { publicKey: "pk_eu", secretKey: STORED_MASK },
          },
          default: { publicKey: "pk_default", secretKey: STORED_MASK },
        }),
      );

      // when
      const result = schema.safeParse(
        values({ secretKey: "", overrideSecretKey: "" }),
      );

      // then
      expect(result.success).toBe(true);
    });
  });
});
