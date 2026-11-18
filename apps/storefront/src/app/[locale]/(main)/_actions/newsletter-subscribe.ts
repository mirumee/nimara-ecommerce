"use server";

import { newsletterSubscribe } from "@nimara/features/home-page/shared/actions/newsletter-subscribe.core";

import { toClientResult } from "@/foundation/errors/to-client-result";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";

export const newsletterSubscribeAction = async ({
  email,
}: {
  email: string;
}) => {
  const result = await newsletterSubscribe(await getServiceRegistry(), {
    email,
  });

  if (
    !result.ok &&
    result.errors[0].code === "NEWSLETTER_NOT_CONFIGURED_ERROR"
  ) {
    storefrontLogger.error("Newsletter submit refused: no provider available.");
  }

  return toClientResult(result);
};
