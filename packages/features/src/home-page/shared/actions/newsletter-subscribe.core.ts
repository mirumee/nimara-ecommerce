import { z } from "zod";

import { FIELD_MAX_LENGTH } from "@nimara/domain/consts";
import { type AsyncResult, err } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export type NewsletterSubscribeInput = { email: string };

export type NewsletterSubscribeResult = AsyncResult<{ acknowledged: true }>;

const emailSchema = z.string().trim().max(FIELD_MAX_LENGTH.email).email();

export async function newsletterSubscribe(
  services: ServiceRegistry,
  { email }: NewsletterSubscribeInput,
): NewsletterSubscribeResult {
  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return err([{ code: "INVALID_VALUE_ERROR", field: "email" }]);
  }

  const newsletterService = await services.getNewsletterService();

  return newsletterService.newsletterSubscribe({ email: parsed.data });
}
