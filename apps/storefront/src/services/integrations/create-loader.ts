import type { Logger } from "@nimara/infrastructure/logging/types";

import type { ProviderRegistry } from "./types";

/**
 * Builds a lazy, cached loader for a single capability (search, CMS page, …).
 *
 * Selection is build-time and env-driven: `resolveProvider` returns the chosen
 * provider id (or `null`), the registry yields the matching factory, and the
 * service is instantiated once and memoized. When no provider is selected — or
 * an unknown id is configured — the loader falls back to `emptyService` so the
 * storefront keeps rendering instead of crashing.
 *
 * Consumers keep calling `registry.getSearchService()`; they never learn which
 * provider answered.
 *
 * @internal Only the service registry should call the returned loader.
 */
export const createServiceLoader = <TService>({
  providers,
  resolveProvider,
  emptyService,
  logger,
}: {
  emptyService: TService;
  logger: Logger;
  providers: ProviderRegistry<TService>;
  resolveProvider: () => string | null;
}) => {
  let instance: TService | null = null;

  return async (): Promise<TService> => {
    if (instance) {
      return instance;
    }

    const provider = resolveProvider();

    if (!provider) {
      instance = emptyService;

      return instance;
    }

    const factory = providers[provider];

    if (!factory) {
      logger.warning(
        `Unknown integration provider "${provider}". Falling back to the empty service.`,
      );
      instance = emptyService;

      return instance;
    }

    instance = await factory(logger);

    return instance;
  };
};
