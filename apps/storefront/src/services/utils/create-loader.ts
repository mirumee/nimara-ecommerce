import { ZodError } from "zod";

import type { Logger } from "@nimara/infrastructure/logging/types";

import type { Capability } from "@/services/capabilities";

type Attempt<TService> = { retry: boolean; service: TService };

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
 * capability must not take down routes that never use it.
 * `logIntegrationConfigIssues` reports which keys are missing when the registry
 * is built.
 *
 * A failed construction memoizes the empty service only when the cause is
 * deterministic. A `ZodError` means the config cannot become valid without a
 * new deployment, so retrying it on every request only burns work. Any other
 * cause — a failed dynamic import, an I/O timeout inside a provider entry
 * point — can succeed on the next call, so the empty service answers that one
 * call and the next call rebuilds. Memoizing a transient failure would degrade
 * a capability until the process dies.
 *
 * What is memoized is the in-flight promise, not the resolved service, so
 * requests that arrive concurrently during the first construction share it
 * instead of each starting their own. `attempt` never rejects, so a memoized
 * rejection cannot poison the cache.
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
  capability: Capability;
  emptyService: TService;
  logger: Logger;
  resolve: () => TId | null;
}) => {
  const attempt = async (): Promise<Attempt<TService>> => {
    const provider = resolve();

    if (!provider) {
      return { service: emptyService, retry: false };
    }

    try {
      return { service: await build(provider, logger), retry: false };
    } catch (error) {
      const isConfigError = error instanceof ZodError;

      /*
       * Provider config schemas name the missing env keys in their messages and
       * never carry their values, so the message is safe to log.
       */
      const context = {
        capability,
        provider,
        reason: error instanceof Error ? error.message : String(error),
      };

      if (isConfigError) {
        logger.critical(
          "Provider configuration is invalid; serving the empty service until the next deployment.",
          context,
        );
      } else {
        logger.error(
          "Provider construction failed; serving the empty service for this call.",
          context,
        );
      }

      return { service: emptyService, retry: !isConfigError };
    }
  };

  let instance: Promise<TService> | null = null;

  return (): Promise<TService> => {
    if (instance) {
      return instance;
    }

    instance = attempt().then(({ service, retry }) => {
      if (retry) {
        instance = null;
      }

      return service;
    });

    return instance;
  };
};
