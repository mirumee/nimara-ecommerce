import { type JSONWebKeySet } from "jose";

declare global {
  // eslint-disable-next-line no-var
  var JWKS_CACHE: Record<string, JSONWebKeySet>;
}

export {};
