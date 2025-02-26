import { createRemoteJWKSet } from "jose";

import { invariant } from "@/lib/util";

import { type JWKSProviderFactory, type JWSProvider } from "./types";

global.JWKS_CACHE = {};

export const JWKSMemoryProvider: JWKSProviderFactory = ({ remoteUrl }) => {
  const remoteJWKS = createRemoteJWKSet(
    new globalThis.URL(`${remoteUrl}/.well-known/jwks.json`),
  );

  const _fetchJwks = async () => {
    await remoteJWKS.reload();
    const jwks = remoteJWKS.jwks();

    invariant(jwks, `Could not fetch JWKS from remote: ${remoteUrl}.`);

    return jwks;
  };

  const set: JWSProvider["set"] = ({ issuer, jwks }) => {
    global.JWKS_CACHE[issuer] = jwks;
  };

  const get: JWSProvider["get"] = async ({ issuer, forceRefresh = false }) => {
    let jwks = global.JWKS_CACHE[issuer];

    if (!jwks || forceRefresh) {
      jwks = await _fetchJwks();
      set({ issuer, jwks: await _fetchJwks() });
    }

    return jwks;
  };

  return {
    set,
    get,
  };
};
