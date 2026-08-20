import { z } from "zod";

const channelConfigSchema = z.object({
  publicKey: z.string().min(1, "Enter the publishable key."),
  // Can be blank at read to mask the secret. Only the server knows whether one exists.
  secretKey: z.string(),
});

/**
 * An override replaces both keys rather than merging, so no channel mixes two
 * accounts. Defaults to `{}`: react-hook-form drops it with the last override.
 */
export const configFormSchema = z.object({
  channelOverrides: z
    .record(z.string().min(1), channelConfigSchema)
    .default({}),
  default: channelConfigSchema,
});

// Optional on the way in, always present after parsing.
export type ConfigFormInput = z.input<typeof configFormSchema>;

export type ConfigFormSchema = z.infer<typeof configFormSchema>;
