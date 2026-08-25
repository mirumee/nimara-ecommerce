import { type AsyncResult } from "@nimara/domain/objects/Result";

/**
 * The success payload is the provider acknowledgement and nothing else. Nimara
 * holds no subscription state, so there is no record to return.
 */
export type NewsletterSubscribeInfra = (opts: {
  email: string;
}) => AsyncResult<{ acknowledged: true }>;

export type NewsletterSubscribeUseCase = NewsletterSubscribeInfra;

export type NewsletterService = {
  newsletterSubscribe: NewsletterSubscribeUseCase;
};
