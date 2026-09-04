import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ok } from "@nimara/domain/objects/Result";

import { type SaleorAppConfigService } from "#root/apps/saleor/config-repository";
import { getAppSettingsFormUseCase } from "#root/use-cases/apps/saleor/get-app-settings-form-use-case";
import { saveAppSettingsUseCase } from "#root/use-cases/apps/saleor/save-app-settings-use-case";

const settingsSchema = z.object({
  publicKey: z.string(),
  secretKey: z.string(),
});

type Settings = z.infer<typeof settingsSchema>;

const SECRET_FIELDS = ["secretKey"] as const;

const SALEOR_DOMAIN = "store.saleor.cloud";

const STORED: Settings = {
  publicKey: "pk_live_visible",
  secretKey: "sk_live_0123456789",
};

const repository = (stored: Settings | null) => {
  const written: Settings[] = [];

  return {
    service: {
      getSettings: async () => ok(stored),
      updateSettings: async ({ settings }: { settings: Settings }) => {
        written.push(settings);

        return ok(settings);
      },
    } as unknown as SaleorAppConfigService<Settings>,
    written,
  };
};

const deps = (stored: Settings | null) => {
  const { service, written } = repository(stored);

  return {
    configRepository: service,
    secretFields: SECRET_FIELDS,
    settingsSchema,
    written,
  };
};

describe("settings-form", () => {
  describe("getAppSettingsFormUseCase", () => {
    it("masks a secret and leaves a plain field alone", async () => {
      // given
      const { written: _, ...input } = deps(STORED);

      // when
      const result = await getAppSettingsFormUseCase(input)({
        saleorDomain: SALEOR_DOMAIN,
      });

      // then the key never leaves the app in full.
      expect(result.data?.publicKey).toBe("pk_live_visible");
      expect(result.data?.secretKey).not.toContain("0123456789");
      expect(result.data?.secretKey).toMatch(/\*+6789$/);
    });

    it("returns every declared field when nothing is stored", async () => {
      // given
      const { written: _, ...input } = deps(null);

      // when
      const result = await getAppSettingsFormUseCase(input)({
        saleorDomain: SALEOR_DOMAIN,
      });

      // then a field missing here is one the form cannot show.
      expect(result.data).toEqual({ publicKey: "", secretKey: "" });
    });
  });

  describe("saveAppSettingsUseCase", () => {
    it("keeps the stored secret when the field comes back blank", async () => {
      // given
      const { written, ...input } = deps(STORED);

      // when
      await saveAppSettingsUseCase(input)({
        data: { publicKey: "pk_live_new", secretKey: "" },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then the form only ever saw a mask, so a blank cannot mean "clear it".
      expect(written).toEqual([
        { publicKey: "pk_live_new", secretKey: STORED.secretKey },
      ]);
    });

    it("replaces the stored secret when the field is filled in", async () => {
      // given
      const { written, ...input } = deps(STORED);

      // when
      await saveAppSettingsUseCase(input)({
        data: { publicKey: STORED.publicKey, secretKey: "sk_live_rotated" },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then
      expect(written[0]?.secretKey).toBe("sk_live_rotated");
    });

    it("clears a plain field submitted empty", async () => {
      // given
      const { written, ...input } = deps(STORED);

      // when
      await saveAppSettingsUseCase(input)({
        data: { publicKey: "  ", secretKey: "" },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then only a secret survives a blank; any other field is cleared.
      expect(written[0]?.publicKey).toBe("");
    });

    it("returns nothing on success", async () => {
      // given
      const { written: _, ...input } = deps(STORED);

      // when
      const result = await saveAppSettingsUseCase(input)({
        data: { publicKey: "pk", secretKey: "sk" },
        saleorDomain: SALEOR_DOMAIN,
      });

      // then the stored shape comes back from a read, not from the write.
      expect(result).toEqual({ ok: true, data: undefined });
    });
  });
});
