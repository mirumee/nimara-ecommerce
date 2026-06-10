import type { TrackSignUpProvider } from "#root/use-cases/tracking/types/sign-up";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#sign_up
 */
export const gtmTrackSignUpInfra = (): TrackSignUpProvider => ({
  async track({ method }) {
    pushDataLayer({
      event: "sign_up",
      method,
    });
  },
});
