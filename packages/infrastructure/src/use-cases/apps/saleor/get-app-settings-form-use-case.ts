import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { maskString } from "@nimara/foundation/lib/security";

import {
  type AppSettingsFormDeps,
  settingNames,
  type SettingsFormData,
} from "#root/use-cases/apps/saleor/settings-form";

const MASKED_LENGTH = 25;

/**
 * What a dashboard renders. A secret never leaves the app in full: it comes
 * back masked, and the form sends a blank field to keep the stored value.
 */
export const getAppSettingsFormUseCase =
  <Settings extends Record<string, string>>({
    configRepository,
    secretFields,
    settingsSchema,
  }: AppSettingsFormDeps<Settings>) =>
  async ({
    saleorDomain,
  }: {
    saleorDomain: string;
  }): AsyncResult<SettingsFormData<Settings>> => {
    const result = await configRepository.getSettings({ saleorDomain });

    if (!result.ok) {
      return result;
    }

    const stored = result.data;
    const secret = new Set<keyof Settings>(secretFields);

    return ok(
      Object.fromEntries(
        settingNames(settingsSchema).map((field) => {
          const value = stored?.[field] ?? "";

          return [
            field,
            secret.has(field) && value
              ? maskString({
                  maxLength: MASKED_LENGTH,
                  str: value,
                  visibleChars: 4,
                })
              : value,
          ];
        }),
      ) as SettingsFormData<Settings>,
    );
  };
