"use server";

import { getLocale } from "next-intl/server";

import { type NewsletterSubscribeStatus } from "@nimara/domain/objects/Newsletter";
import { type AsyncResult, err } from "@nimara/domain/objects/Result";
import {
  grantedSubmissionSchema,
  type Submission,
} from "@nimara/features/home-page/shared/schema/newsletter";

import { paths } from "@/foundation/routing/paths";
import { getStoreUrl, getStoreUrlWithPath } from "@/foundation/server";
import { getServiceRegistry } from "@/services/registry";

/**
 * The one server-side choke point every subscription passes through, and where
 * a deployment attaches rate limiting or a challenge.
 *
 * Consent is turned into data here rather than accepted from the client: the
 * timestamp and the privacy-policy URL are the server's, so a forged submission
 * cannot claim the shopper agreed to something they were never shown.
 */
export const newsletterSubscribeAction = async (
  values: Submission,
): AsyncResult<NewsletterSubscribeStatus> => {
  const submission = grantedSubmissionSchema.safeParse(values);

  if (!submission.success) {
    return err([
      {
        code: "NEWSLETTER_CONSENT_REQUIRED_ERROR",
        message: "The submission is incomplete or consent was not given.",
      },
    ]);
  }

  const [locale, storeUrl, services] = await Promise.all([
    getLocale(),
    getStoreUrl(),
    getServiceRegistry(),
  ]);
  const newsletterService = await services.getNewsletterService();

  return newsletterService.newsletterSubscribe({
    email: submission.data.email,
    name: submission.data.name,
    locale,
    consent: {
      consentedAt: new Date().toISOString(),
      privacyPolicyUrl: getStoreUrlWithPath(
        storeUrl,
        paths.privacyPolicy.asPath(),
      ),
    },
  });
};
