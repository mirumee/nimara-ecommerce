import { type JSONWebKeySet } from "jose";

export type JWKSProviderFactory = (opts: { remoteUrl: string }) => {
  get: (opts: {
    forceRefresh?: boolean;
    issuer: string;
  }) => Promise<JSONWebKeySet>;
  set: (opts: { issuer: string; jwks: JSONWebKeySet }) => void;
};

export type JWSProvider = ReturnType<JWKSProviderFactory>;
