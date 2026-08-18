import { ok } from "@nimara/domain/objects/Result";

import type { NewsletterSubscribeInfra } from "#root/use-cases/newsletter/types";

import type { DummyNewsletterServiceConfig } from "../types";

/**
 * Carries the configured happy path with no outbound call, so the whole
 * submission path runs without an account, an email or a send quota. Provider
 * failures are injected at the transport level instead of taught here — that is
 * what exercises the real adapter's mapping into the error codes.
 */
export const dummyNewsletterSubscribeInfra =
  ({ logger }: DummyNewsletterServiceConfig): NewsletterSubscribeInfra =>
  async ({ locale }) => {
    logger.info("Newsletter subscribe finished", {
      provider: "dummy",
      outcome: "accepted",
      locale,
    });

    return ok("CONFIRMATION_PENDING");
  };
