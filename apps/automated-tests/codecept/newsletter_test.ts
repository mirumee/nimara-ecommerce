import { timeout_seconds } from "./data/constants";

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
