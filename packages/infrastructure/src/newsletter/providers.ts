import { newsletterSubscribeUseCase } from "#root/use-cases/newsletter/newsletter-subscribe-use-case";
import { type NewsletterService } from "#root/use-cases/newsletter/types";

import { brevoNewsletterSubscribeInfra } from "./brevo/infrastructure/newsletter-subscribe-infra";
import { dummyNewsletterSubscribeInfra } from "./dummy/infrastructure/newsletter-subscribe-infra";
import { type DummyNewsletterServiceConfig } from "./dummy/types";
import type { BrevoNewsletterServiceConfig } from "./types";

export const brevoNewsletterService = (config: BrevoNewsletterServiceConfig) =>
  ({
    newsletterSubscribe: newsletterSubscribeUseCase({
      newsletterSubscribeInfra: brevoNewsletterSubscribeInfra(config),
    }),
  }) satisfies NewsletterService;

export const dummyNewsletterService = (config: DummyNewsletterServiceConfig) =>
  ({
    newsletterSubscribe: newsletterSubscribeUseCase({
      newsletterSubscribeInfra: dummyNewsletterSubscribeInfra(config),
    }),
  }) satisfies NewsletterService;
