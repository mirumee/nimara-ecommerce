import { newsletterSubscribeUseCase } from "#root/use-cases/newsletter/newsletter-subscribe-use-case";
import type { NewsletterService } from "#root/use-cases/newsletter/types";

import { type KlaviyoNewsletterServiceConfig } from "../types";
import { klaviyoNewsletterSubscribeInfra } from "./infrastructure/newsletter-subscribe-infra";

export const klaviyoNewsletterService = (
  config: KlaviyoNewsletterServiceConfig,
) =>
  ({
    newsletterSubscribe: newsletterSubscribeUseCase({
      newsletterSubscribeInfra: klaviyoNewsletterSubscribeInfra(config),
    }),
  }) satisfies NewsletterService;
