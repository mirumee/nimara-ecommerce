import { type AsyncResult, ok } from "@nimara/domain/objects/Result";

import {
  type SaleorAppSettingsFormDeps,
  settingNames,
  type SettingsFormInput,
} from "#root/use-cases/apps/saleor/settings-form";

/**
 * Writes what a dashboard submitted. This is the form's save, not the store's:
 * a blank secret keeps the stored one, because the form only ever saw a mask.
 * A caller writing settings programmatically uses the repository directly.
 */
export const saveSaleorAppSettingsUseCase =
  <Settings extends Record<string, string>>({
    configRepository,
    secretFields,
    settingsSchema,
  }: SaleorAppSettingsFormDeps<Settings>) =>
  async ({
    data,
    saleorDomain,
  }: {
    data: SettingsFormInput<Settings>;
    saleorDomain: string;
  }): AsyncResult<void> => {
    const stored = await configRepository.getSettings({ saleorDomain });

    if (!stored.ok) {
      return stored;
    }

    const secret = new Set<keyof Settings>(secretFields);

    const settings = Object.fromEntries(
      settingNames(settingsSchema).map((field) => {
        const incoming = data[field]?.trim() ?? "";
        const current = stored.data?.[field] ?? "";

        // `incoming || current` would leave every field impossible to clear.
        return [field, secret.has(field) && !incoming ? current : incoming];
      }),
    ) as Settings;

    const saved = await configRepository.updateSettings({
      saleorDomain,
      settings,
    });

    if (!saved.ok) {
      return saved;
    }

    return ok(undefined);
  };
