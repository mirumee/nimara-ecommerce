import { describe, expect, it } from "vitest";

import {
  maskChannelSecrets,
  pruneChannelConfigSet,
  withStoredSecrets,
} from "./app-config";

type Config = { publicKey: string; secretKey: string };

const SECRET_FIELDS = ["secretKey"] as const;

describe("maskChannelSecrets", () => {
  it("masks a secret field and leaves a plain field alone", () => {
    // given
    const config: Config = {
      publicKey: "pk_live_visible",
      secretKey: "sk_live_0123456789",
    };

    // when
    const result = maskChannelSecrets({ config, secretFields: SECRET_FIELDS });

    // then
    expect(result.publicKey).toBe("pk_live_visible");
    expect(result.secretKey).not.toContain("0123456789");
    expect(result.secretKey).toMatch(/\*+6789$/);
  });

  it("leaves a blank secret blank", () => {
    // given
    const config: Config = { publicKey: "pk", secretKey: "" };

    // when
    const result = maskChannelSecrets({ config, secretFields: SECRET_FIELDS });

    // then
    expect(result.secretKey).toBe("");
  });
});

describe("withStoredSecrets", () => {
  const stored: Config = { publicKey: "pk_old", secretKey: "sk_old" };

  it("keeps the stored secret when the field comes back blank", () => {
    // when
    const result = withStoredSecrets({
      incoming: { publicKey: "pk_new", secretKey: "" },
      secretFields: SECRET_FIELDS,
      stored,
    });

    // then
    expect(result).toEqual({ publicKey: "pk_new", secretKey: "sk_old" });
  });

  it("replaces the stored secret when the field is filled in", () => {
    // when
    const result = withStoredSecrets({
      incoming: { publicKey: "pk_old", secretKey: "sk_new" },
      secretFields: SECRET_FIELDS,
      stored,
    });

    // then
    expect(result.secretKey).toBe("sk_new");
  });

  it("has nothing stored to fall back to", () => {
    // when
    const result = withStoredSecrets({
      incoming: { publicKey: "pk", secretKey: "" },
      secretFields: SECRET_FIELDS,
      stored: null,
    });

    // then
    expect(result.secretKey).toBe("");
  });
});

describe("pruneChannelConfigSet", () => {
  it("drops overrides for channels no longer in Saleor", () => {
    // given
    const configSet = {
      channelOverrides: {
        eur: { publicKey: "pk_eur", secretKey: "sk_eur" },
        usd: { publicKey: "pk_usd", secretKey: "sk_usd" },
      },
      default: { publicKey: "pk_default", secretKey: "sk_default" },
      defaultChannelSlug: "default-channel",
    };

    // when
    const result = pruneChannelConfigSet({
      channelSlugs: ["usd", "default-channel"],
      configSet,
    });

    // then
    expect(result.channelOverrides).toEqual({
      usd: { publicKey: "pk_usd", secretKey: "sk_usd" },
    });
  });

  it("clears the default channel once it is removed from Saleor", () => {
    // given
    const configSet = {
      channelOverrides: {},
      default: { publicKey: "pk", secretKey: "sk" },
      defaultChannelSlug: "removed-channel",
    };

    // when
    const result = pruneChannelConfigSet({
      channelSlugs: ["default-channel"],
      configSet,
    });

    // then
    expect(result.defaultChannelSlug).toBeNull();
  });
});
