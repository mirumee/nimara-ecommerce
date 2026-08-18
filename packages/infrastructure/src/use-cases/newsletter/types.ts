import type {
  NewsletterConsent,
  NewsletterSubscribeStatus,
} from "@nimara/domain/objects/Newsletter";
import { type AsyncResult } from "@nimara/domain/objects/Result";

/**
 * Everything that crosses the newsletter provider boundary. List, template and
 * redirect identifiers are deliberately absent — they are configuration of the
 * selected adapter, so no caller holds provider knowledge. `locale` crosses
 * because the confirmation email is the provider's, and locale is the only way
 * an adapter can pick the right template for the shopper.
 */
export type NewsletterSubscribeOptions = {
  consent: NewsletterConsent;
  email: string;
  locale: string;
  name?: string;
};

export type NewsletterSubscribeInfra = (
  opts: NewsletterSubscribeOptions,
) => AsyncResult<NewsletterSubscribeStatus>;

export type NewsletterSubscribeUseCase = NewsletterSubscribeInfra;

export type NewsletterService = {
  newsletterSubscribe: NewsletterSubscribeUseCase;
};
