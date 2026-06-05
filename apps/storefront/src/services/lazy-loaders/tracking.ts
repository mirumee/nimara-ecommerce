import {
  getTrackingService,
  type TrackingService,
} from "@nimara/infrastructure/tracking/service";

/**
 * Creates a lazy loader for the tracking service. Used by the service registry
 * (server) and directly by client components — the GTM dataLayer is
 * client-only, so tracking executes on the client.
 */
export const createTrackingServiceLoader = () => {
  let trackingServiceInstance: TrackingService | null = null;

  return async (): Promise<TrackingService> => {
    if (trackingServiceInstance) {
      return trackingServiceInstance;
    }

    trackingServiceInstance = getTrackingService();

    return trackingServiceInstance;
  };
};
