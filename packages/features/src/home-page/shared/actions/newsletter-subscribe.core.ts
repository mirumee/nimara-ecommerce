import { type AsyncResult } from "@nimara/domain/objects/Result";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export type NewsletterSubscribeInput = { email: string };

export type NewsletterSubscribeResult = AsyncResult<{ acknowledged: true }>;

export async function newsletterSubscribe(
  services: ServiceRegistry,
  { email }: NewsletterSubscribeInput,
): NewsletterSubscribeResult {
  const newsletterService = await services.getNewsletterService();

  return newsletterService.newsletterSubscribe({ email });
}
