"use server";

import { err } from "@nimara/domain/objects/Result";
import { newsletterSubscribe } from "@nimara/features/home-page/shared/actions/newsletter-subscribe.core";

import { toClientResult } from "@/foundation/errors/to-client-result";
import { resolveNewsletterProvider } from "@/services/integrations/resolve";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";

export const newsletterSubscribeAction = async ({
  email,
}: {
  email: string;
}) => {
  const provider = resolveNewsletterProvider();

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

  return toClientResult(
    await newsletterSubscribe(await getServiceRegistry(), { email }),
  );
};
