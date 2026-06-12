import type { UpdateConsentProvider } from "#root/use-cases/tracking/types/update-consent";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Pushes a Google Consent Mode v2 `update` signal to the GTM dataLayer
 * with the provided categories mapped to GTM consent signals.
 */
export const gtmUpdateConsentInfra = (): UpdateConsentProvider => ({
  track({ analytics }) {
    pushDataLayer("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: analytics ? "granted" : "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  },
});
