import { type z } from "zod";

import { appSettings } from "@/domain/app-config";

/**
 * Every field optional and blank-tolerant: the form sends a secret back blank
 * to mean "keep the stored one", and a mask is never a value worth saving.
 */
export const settingsFormSchema = appSettings.partial();

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
