import { z } from "zod";

import { type Logger } from "#root/logging/types";

import { type BrevoNewsletterServiceConfig } from "../types";

/**
 * A shopper waits for this call. A request that outlives the budget is
 * abandoned rather than retried: Brevo may already have accepted it and sent
 * the confirmation email, so a retry would send a second one.
 */
const DEFAULT_TIMEOUT_MS = 3_000;

const templateIdSchema = z.number().int().positive();

/**
 * A bare id is the common case; the locale-keyed map exists because Brevo picks
 * the confirmation email by template, and locale is what the boundary carries
 * for exactly that.
 */
const templateIdsSchema = z
  .object({
    default: z.number({
      error:
        'NEWSLETTER_BREVO_DOI_TEMPLATE_ID given as a JSON map needs a numeric "default" template id.',
    }),
  })
  .catchall(templateIdSchema);

export const brevoNewsletterEnvSchema = z.object({
  NEWSLETTER_BREVO_API_KEY: z
    .string()
    .min(1, "NEWSLETTER_BREVO_API_KEY is required for the Brevo newsletter."),
  NEWSLETTER_BREVO_LIST_IDS: z
    .string()
    .min(1, "NEWSLETTER_BREVO_LIST_IDS is required for the Brevo newsletter.")
    .transform((value) =>
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .map(Number),
    )
    .pipe(
      z
        .array(
          z
            .number(
              "NEWSLETTER_BREVO_LIST_IDS must be a comma-separated list of Brevo list ids.",
            )
            .int()
            .positive(),
        )
        .min(
          1,
          "NEWSLETTER_BREVO_LIST_IDS must name at least one Brevo list id.",
        ),
    ),
  NEWSLETTER_BREVO_DOI_TEMPLATE_ID: z
    .string()
    .min(
      1,
      "NEWSLETTER_BREVO_DOI_TEMPLATE_ID is required for the Brevo newsletter.",
    )
    .transform((value, ctx) => {
      const trimmed = value.trim();

      if (/^\d+$/.test(trimmed)) {
        return { default: Number(trimmed) };
      }

      try {
        return JSON.parse(trimmed) as unknown;
      } catch {
        ctx.addIssue({
          code: "custom",
          message:
            "NEWSLETTER_BREVO_DOI_TEMPLATE_ID must be a template id or a JSON map of locale to template id.",
        });

        return z.NEVER;
      }
    })
    .pipe(templateIdsSchema),
  NEWSLETTER_BREVO_REDIRECT_URL: z.url(
    "NEWSLETTER_BREVO_REDIRECT_URL must be the absolute URL a shopper lands on after confirming.",
  ),
  NEWSLETTER_BREVO_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_TIMEOUT_MS),
});

export const toBrevoNewsletterConfig = (
  env: Record<string, string | undefined>,
  logger: Logger,
): BrevoNewsletterServiceConfig => {
  const parsed = brevoNewsletterEnvSchema.parse(env);

  return {
    apiKey: parsed.NEWSLETTER_BREVO_API_KEY,
    listIds: parsed.NEWSLETTER_BREVO_LIST_IDS,
    templateIds: parsed.NEWSLETTER_BREVO_DOI_TEMPLATE_ID,
    redirectUrl: parsed.NEWSLETTER_BREVO_REDIRECT_URL,
    timeoutMs: parsed.NEWSLETTER_BREVO_TIMEOUT_MS,
    logger,
  };
};
