import { type SaleorAppConfigService } from "#root/apps/saleor/config-repository";

/**
 * Only the field names are read. A form covers every declared setting, so a
 * field with nothing stored yet still appears in it.
 */
export type SettingsShape<Settings> = {
  shape: Record<keyof Settings & string, unknown>;
};

export type SettingsFormData<Settings> = Record<keyof Settings, string>;

export type SettingsFormInput<Settings> = Partial<SettingsFormData<Settings>>;

export type AppSettingsFormDeps<Settings extends Record<string, string>> = {
  configRepository: SaleorAppConfigService<Settings>;
  // Not derivable from the schema: a string field says nothing about secrecy.
  secretFields: readonly (keyof Settings)[];
  settingsSchema: SettingsShape<Settings>;
};

export const settingNames = <Settings>(schema: SettingsShape<Settings>) =>
  Object.keys(schema.shape) as (keyof Settings & string)[];
