import type { TrackLoginProvider } from "#root/use-cases/tracking/types/login";

import { pushDataLayer } from "../helpers/push-data-layer";

/**
 * Reference: https://developers.google.com/tag-platform/gtagjs/reference/events#login
 */
export const gtmTrackLoginInfra = (): TrackLoginProvider => ({
  async track({ method }) {
    pushDataLayer({
      event: "login",
      method,
    });
  },
});
