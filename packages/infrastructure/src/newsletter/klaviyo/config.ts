import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type KlaviyoNewsletterServiceConfig } from "../types";

const REQUEST_TIMEOUT_MS = 5_000;

export const klaviyoNewsletterEnvSchema = z.object({
  NEWSLETTER_KLAVIYO_LIST_ID: z
    .string()
    .min(1, "NEWSLETTER_KLAVIYO_LIST_ID is required for Klaviyo newsletter."),
  NEWSLETTER_KLAVIYO_PRIVATE_API_KEY: z
    .string()
    .min(
      1,
      "NEWSLETTER_KLAVIYO_PRIVATE_API_KEY is required for Klaviyo newsletter.",
    ),
});

export const toKlaviyoNewsletterConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): KlaviyoNewsletterServiceConfig => {
  const parsed = klaviyoNewsletterEnvSchema.parse(env);

  return {
    listId: parsed.NEWSLETTER_KLAVIYO_LIST_ID,
    privateApiKey: parsed.NEWSLETTER_KLAVIYO_PRIVATE_API_KEY,
    timeoutMs: REQUEST_TIMEOUT_MS,
    logger,
  };
};
