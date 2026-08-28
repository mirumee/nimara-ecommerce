import { type AsyncResult } from "@nimara/domain/objects/Result";

export type NewsletterSubscribeInfra = (opts: {
  email: string;
}) => AsyncResult<{ acknowledged: true }>;

export type NewsletterSubscribeUseCase = NewsletterSubscribeInfra;

export type NewsletterService = {
  newsletterSubscribe: NewsletterSubscribeUseCase;
};
