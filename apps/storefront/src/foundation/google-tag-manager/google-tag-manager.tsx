import { GoogleTagManager as NextGoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

import { type ConsentCategories } from "@/foundation/consent";

/**
 * Maps consent categories to a Google Consent Mode v2 state. Analytics is the
 * only opt-in category, so everything the storefront does not use stays denied
 * (ads, functionality, personalization). `security_storage` is granted because
 * strictly-necessary cookies (auth, cart, locale/region) are exempt from
 * consent.
 */
const toConsentDefaultState = ({ analytics }: ConsentCategories) => ({
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: analytics ? "granted" : "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
});

type Props = {
  auth?: string;
  categories: ConsentCategories;
  gtmId: string;
  preview?: string;
};

/**
 * Loads GTM via `@next/third-parties` and pushes a Google Consent Mode v2
 * `default` signal to the dataLayer before the GTM script runs. Consent
 * `update` signals are sent later from the cookie banner via the tracking
 * service.
 */
export const GoogleTagManager = ({
  auth,
  categories,
  gtmId,
  preview,
}: Props) => {
  const consentDefaultScript = `
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag(
      "consent",
      "default",
      ${JSON.stringify(toConsentDefaultState(categories))}
    );
`.trim();

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="gtm-consent-default" strategy="beforeInteractive">
        {consentDefaultScript}
      </Script>
      <NextGoogleTagManager gtmId={gtmId} auth={auth} preview={preview} />
    </>
  );
};
