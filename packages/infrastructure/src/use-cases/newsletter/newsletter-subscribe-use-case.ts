import type { NewsletterConsent } from "@nimara/domain/objects/Newsletter";
import { err } from "@nimara/domain/objects/Result";

import type {
  NewsletterSubscribeInfra,
  NewsletterSubscribeUseCase,
} from "./types";

const isConsentGranted = ({
  consentedAt,
  privacyPolicyUrl,
}: NewsletterConsent) =>
  !Number.isNaN(Date.parse(consentedAt)) && URL.canParse(privacyPolicyUrl);

/**
 * The consent check sits in front of every adapter rather than inside each one,
 * so no provider can be reached without it. The render gate can be bypassed by
 * calling the server action directly, which is what this rests on.
 */
export const newsletterSubscribeUseCase = ({
  newsletterSubscribeInfra,
}: {
  newsletterSubscribeInfra: NewsletterSubscribeInfra;
}): NewsletterSubscribeUseCase => {
  return async (opts) => {
    if (!isConsentGranted(opts.consent)) {
      return err([
        {
          code: "NEWSLETTER_CONSENT_REQUIRED_ERROR",
          field: "consent",
          message:
            "A subscription needs a consent timestamp and the absolute URL of the privacy policy the shopper was shown.",
        },
      ]);
    }

    return newsletterSubscribeInfra(opts);
  };
};
