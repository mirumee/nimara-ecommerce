import { z } from "zod";

const channelConfigInput = z.object({
  publicKey: z.string(),
  // Can be blank at read to mask the secret. Only the server knows whether one exists.
  secretKey: z.string(),
});

/**
 * An override replaces both keys rather than merging, so no channel mixes
 * keys from two configs. `channelOverrides` defaults to `{}`: react-hook-form
 * drops it with the last override.
 */
export const configFormSchema = z.object({
  channelOverrides: z.record(z.string().min(1), channelConfigInput).default({}),
  default: channelConfigInput,
  defaultChannelSlug: z
    .string()
    .min(1, "Choose the channel the other channels inherit from."),
});

export type ConfigFormInput = z.input<typeof configFormSchema>;

export type ConfigFormSchema = z.infer<typeof configFormSchema>;
