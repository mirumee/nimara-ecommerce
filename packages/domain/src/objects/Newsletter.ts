/**
 * @description Statuses a newsletter subscription attempt can resolve to. The
 * first value is what a caller renders by default: confirmation is always the
 * provider's job, so a submission the provider accepted is never active yet.
 */
export const NEWSLETTER_SUBSCRIBE_STATUSES = ["CONFIRMATION_PENDING"] as const;

export type NewsletterSubscribeStatus =
  (typeof NEWSLETTER_SUBSCRIBE_STATUSES)[number];

/**
 * Consent travels as data rather than a boolean so the provider holds the
 * record of what was agreed and when. Nimara keeps no copy of it, so there is
 * nowhere else for that record to live.
 */
export type NewsletterConsent = {
  consentedAt: string;
  privacyPolicyUrl: string;
};
