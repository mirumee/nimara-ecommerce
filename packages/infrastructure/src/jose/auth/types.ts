import { type AsyncResult } from "@nimara/domain/objects/Result";

// Verified claims, unparsed: what they mean is the caller's to say.
export type JwtClaims = Record<string, unknown>;

// Verifies signatures against an issuer's JWKS.
export type JoseAuthService = {
  verifyDetachedJws: (opts: {
    jws: string;
    payload: string | undefined;
  }) => AsyncResult<true>;
  verifyJwt: (jwt: string) => AsyncResult<JwtClaims>;
};
