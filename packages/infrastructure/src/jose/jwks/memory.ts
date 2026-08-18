import { err, ok } from "@nimara/domain/objects/Result";

import { type JwkSet, type JwksRepositoryFactory } from "#root/jose/jwks/types";

/**
 * In-memory JWKS repository. The cache lives on `globalThis` so it is shared
 * across requests within a serverless instance.
 */
const CACHE_KEY = "__NIMARA_JWKS__";

const getCache = (): Map<string, JwkSet> => {
  const globalRef = globalThis as typeof globalThis & {
    [CACHE_KEY]?: Map<string, JwkSet>;
  };

  globalRef[CACHE_KEY] ??= new Map();

  return globalRef[CACHE_KEY];
};

export const jwksMemoryRepository: JwksRepositoryFactory = ({
  remoteUrl,
  logger,
}) => {
  const jwksUrl = `${new URL(remoteUrl).origin}/.well-known/jwks.json`;

  return {
    get: async ({ forceRefresh = false }) => {
      const cache = getCache();

      if (!forceRefresh) {
        const cached = cache.get(jwksUrl);

        if (cached) {
          return ok(cached);
        }
      }

      try {
        const response = await fetch(jwksUrl, {
          signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
          return err([
            {
              code: "JWKS_FETCH_ERROR",
              message: `Failed to fetch JWKS from ${jwksUrl}: ${response.status}.`,
            },
          ]);
        }

        const jwks = (await response.json()) as JwkSet;

        cache.set(jwksUrl, jwks);

        return ok(jwks);
      } catch (error) {
        logger?.error("Failed to fetch JWKS.", { jwksUrl, error });

        return err([
          {
            code: "JWKS_FETCH_ERROR",
            message: `Failed to fetch JWKS from ${jwksUrl}.`,
            originalError: error,
          },
        ]);
      }
    },
  };
};
