import type { TrackingProvider } from "./types/provider";

/**
 * Generic factory for tracking use-cases. Caller binds the event-specific
 * input type; providers are passed at construction. Every provider runs in
 * parallel for every event.
 *
 * To run a provider only for certain event origins (e.g. Algolia for
 * search-sourced events), see the routing extension note in `./types/provider`.
 *
 * Example:
 *   const trackAddToCart = createTrackingUseCase<TrackAddToCartInput>({
 *     providers: [...],
 *   });
 */
export const createTrackingUseCase =
  <TInput>({ providers }: { providers: TrackingProvider<TInput>[] }) =>
  async (input: TInput) => {
    await Promise.all(providers.map((provider) => provider.track(input)));
  };
