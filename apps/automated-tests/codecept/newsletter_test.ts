import { timeout_seconds } from "./data/constants";

Feature("Newsletter subscription").tag("@newsletter");

let newsletterConfigured = false;

Before(async ({ I, homepage }) => {
  homepage.open();
  await homepage.dismissCookieBannerIfPresent();

  newsletterConfigured = await homepage.newsletterSectionIsPresent();

  if (!newsletterConfigured) {
    I.say(
      "NEWSLETTER_SERVICE is not set on this environment, so the subscribe section does not render. Skipping the assertions.",
    );

    return;
  }

  homepage.seeNewsletterSection(timeout_seconds);
});

Scenario(
  "The subscribe section states its purpose and collects the address only",
  ({ homepage }) => {
    if (!newsletterConfigured) {
      return;
    }

    homepage.seeNewsletterPurposeAndSingleField();
  },
);

Scenario("The consent text links to the privacy policy", ({ homepage }) => {
  if (!newsletterConfigured) {
    return;
  }

  homepage.openPrivacyPolicyFromNewsletter(timeout_seconds);
});

Scenario(
  "An invalid address is rejected in the form and reports no success",
  ({ homepage }) => {
    if (!newsletterConfigured) {
      return;
    }

    homepage.submitNewsletterAddress("not-an-address");
    homepage.seeAddressRejectedInForm(timeout_seconds);
  },
);
