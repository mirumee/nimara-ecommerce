import {
  getTrackingService,
  type TrackingService,
} from "@nimara/infrastructure/tracking/service";

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
