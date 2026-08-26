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
 * A selected provider whose config is missing or invalid degrades the same way:
 * every provider config mapper validates with a throwing `parse`, and a broken
 * capability must not take down routes that never use it. The empty service is
 * memoized too, so a broken deployment does not retry the failing construction
 * on every request. `logIntegrationConfigIssues` reports which keys are missing
 * when the registry is built.
 *
 * The provider catalog and wiring live in infrastructure — this helper only owns
 * the lazy/cache/empty-fallback lifecycle.
 *
 * @internal Only the service registry should call the returned loader.
 */
export const createServiceLoader = <TService, TId extends string>({
  capability,
  resolve,
  build,
  emptyService,
  logger,
}: {
  build: (provider: TId, logger: Logger) => Promise<TService>;
  capability: string;
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

    try {
      instance = await build(provider, logger);
    } catch (error) {
      /*
       * Provider config schemas name the missing env keys in their messages and
       * never carry their values, so the message is safe to log.
       */
      logger.critical(
        "Provider construction failed; serving the empty service.",
        {
          capability,
          provider,
          reason: error instanceof Error ? error.message : String(error),
        },
      );

      instance = emptyService;
    }

    return instance;
  };
};
