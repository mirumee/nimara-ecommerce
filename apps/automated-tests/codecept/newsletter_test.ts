import { timeout_seconds } from "./data/constants";

/*
 * These scenarios need a deployment where a newsletter provider is configured,
 * because the subscribe section is not rendered otherwise. Run them with
 * `--grep @newsletter` against such an environment, and exclude the tag
 * elsewhere. The mirror case — no provider, no section — needs a deployment
 * without one and stays a manual check.
 *
 * Nothing here submits an address the provider would accept: a passing run must
 * not write a profile into the merchant's list.
 */
Feature("Newsletter subscription").tag("@newsletter");

Before(async ({ homepage }) => {
  homepage.open();
  await homepage.dismissCookieBannerIfPresent();
  homepage.seeNewsletterSection(timeout_seconds);
});

Scenario(
  "The subscribe section states its purpose and collects the address only",
  ({ homepage }) => {
    homepage.seeNewsletterPurposeAndSingleField();
  },
);

Scenario("The consent text links to the privacy policy", ({ homepage }) => {
  homepage.openPrivacyPolicyFromNewsletter(timeout_seconds);
});

Scenario(
  "An invalid address is rejected in the form and reports no success",
  ({ homepage }) => {
    homepage.submitNewsletterAddress("not-an-address");
    homepage.seeAddressRejectedInForm(timeout_seconds);
  },
);
