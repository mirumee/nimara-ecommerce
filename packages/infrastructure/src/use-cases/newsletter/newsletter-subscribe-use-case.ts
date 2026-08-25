import type {
  NewsletterSubscribeInfra,
  NewsletterSubscribeUseCase,
} from "./types";

export const newsletterSubscribeUseCase = ({
  newsletterSubscribeInfra,
}: {
  newsletterSubscribeInfra: NewsletterSubscribeInfra;
}): NewsletterSubscribeUseCase => {
  return newsletterSubscribeInfra;
};
