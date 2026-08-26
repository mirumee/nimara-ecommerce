"use server";

import { err } from "@nimara/domain/objects/Result";
import { newsletterSubscribe } from "@nimara/features/home-page/shared/actions/newsletter-subscribe.core";

import { toClientResult } from "@/foundation/errors/to-client-result";
import { resolveNewsletterProvider } from "@/services/integrations/resolve";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";

/**
 * Server action wrapper for newsletter subscription.
 * This is the only file that uses "use server" and Next.js-specific APIs.
 */
export const newsletterSubscribeAction = async ({
  email,
}: {
  email: string;
}) => {
  const provider = resolveNewsletterProvider();

  // A client rendered before the provider was removed can still post here.
  if (!provider) {
    storefrontLogger.error("Newsletter submit refused: no provider selected.");

    return toClientResult<{ acknowledged: true }>(
      err([
        {
          code: "NEWSLETTER_NOT_CONFIGURED_ERROR" as const,
          message: "No newsletter provider is selected for this deployment.",
        },
      ]),
    );
  }

  // The provider logs its own failures with the response status. Nothing here
  // may log the submitted address.
  return toClientResult(
    await newsletterSubscribe(await getServiceRegistry(), { email }),
  );
};
