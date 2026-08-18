import { type AsyncResult } from "@nimara/domain/objects/Result";

/**
 * Verifies signatures against an issuer's JWKS.
 */
export type JoseAuthService = {
  verifyDetachedJws: (opts: {
    jws: string;
    payload: string | undefined;
  }) => AsyncResult<true>;
  verifyJwt: (jwt: string) => AsyncResult<true>;
};
