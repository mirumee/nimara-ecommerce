import type { Logger } from "@nimara/infrastructure/logging/types";

/**
 * Builds a lazy, cached loader for a single capability (search, CMS page, …).
 *
 * Selection is build-time and env-driven: `resolve` returns the chosen provider
 * id (or `null`), `build` instantiates the service for that id (delegating to
 * the infrastructure `create*Service` entry point), and the result is memoized.
 * When no provider is selected the loader returns `emptyService` so the
 * storefront keeps rendering instead of crashing.
 *
 * The provider catalog and wiring live in infrastructure — this helper only owns
 * the lazy/cache/empty-fallback lifecycle.
 *
 * @internal Only the service registry should call the returned loader.
 */
export const createServiceLoader = <TService, TId extends string>({
  resolve,
  build,
  emptyService,
  logger,
}: {
  build: (provider: TId, logger: Logger) => Promise<TService>;
  emptyService: TService;
  logger: Logger;
  resolve: () => TId | null;
}) => {
  let instance: TService | null = null;

  return async (): Promise<TService> => {
    if (instance) {
      return instance;
    }

    const provider = resolve();

    if (!provider) {
      instance = emptyService;

      return instance;
    }

    instance = await build(provider, logger);

    return instance;
  };
};
