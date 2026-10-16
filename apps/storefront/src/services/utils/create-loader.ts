import { ZodError } from "zod";

import type { Logger } from "@nimara/infrastructure/logging/types";

import type { Capability } from "@/services/capabilities";

type Attempt<TService> = { retry: boolean; service: TService };

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
    let provider: TId | null = null;

    try {
      provider = resolve();

      if (!provider) {
        return { service: emptyService, retry: false };
      }

      return { service: await build(provider, logger), retry: false };
    } catch (error) {
      const isConfigError = error instanceof ZodError;

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
