import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type AsyncResult, err } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export type NewsletterSubscribeInput = { email: string };

export type NewsletterSubscribeResult = AsyncResult<{ acknowledged: true }>;

/*
 * This endpoint carries no rate limit by decision (ADR-0004), so the address
 * length is one of the few bounds the application still owns before Klaviyo.
 */
const emailSchema = z.string().trim().max(FIELD_MAX_LENGTH.email).email();

/**
 * Pure newsletter subscribe function that can be used in any context.
 * This function has no dependencies on Next.js or app-specific code.
 *
 * @param services - Service registry containing the newsletter service
 * @param input - Input parameters: the submitted email address
 * @returns A promise that resolves to the provider acknowledgement or an error
 */
export async function newsletterSubscribe(
  services: ServiceRegistry,
  { email }: NewsletterSubscribeInput,
): NewsletterSubscribeResult {
  const parsed = emailSchema.safeParse(email);

  // The form validates too, but a post can arrive without it, and a malformed
  // address must not reach the provider.
  if (!parsed.success) {
    return err([{ code: "INVALID_VALUE_ERROR", field: "email" }]);
  }

  const newsletterService = await services.getNewsletterService();

  return newsletterService.newsletterSubscribe({ email: parsed.data });
}
