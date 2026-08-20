import { type AsyncResult } from "@nimara/domain/objects/Result";

import { type Logger } from "#root/logging/types";

/**
 * A JSON Web Key Set (RFC 7517) — a plain data shape, independent of any
 * verification library.
 */
export type JwkSet = { keys: Array<Record<string, unknown>> };

/**
 * Fetches (and caches) an issuer's JWK Set. Returns the raw key set.
 */
export type JwksRepository = {
  get: (opts: { forceRefresh?: boolean }) => AsyncResult<JwkSet>;
};

export type JwksRepositoryFactory = (opts: {
  logger?: Logger;
  remoteUrl: string;
}) => JwksRepository;
