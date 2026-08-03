import { createLocalJWKSet, flattenedVerify, jwtVerify } from "jose";
import { JWTInvalid } from "jose/errors";

import { type JWSProvider } from "@/lib/jwks/types";

/**
 * @param saleorDomain - Tenant the token is used against, which both keys the
 * cached key set and decides where it is fetched from. The token's own `iss`
 * claim is never consulted, so a token signed by another Saleor cannot be
 * replayed against this tenant.
 */
export const verifyJWTSignature = async ({
  jwt,
  jwksProvider,
  saleorDomain,
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
  jwksProvider: JWSProvider;
  jwt: string;
  saleorDomain: string;
}): Promise<void> => {
  const saleorJwks = await jwksProvider.get({
    issuer: saleorDomain,
    forceRefresh,
  });
  const jwks = createLocalJWKSet(saleorJwks);

  try {
    await jwtVerify(jwt, jwks);
  } catch (err) {
    if (err instanceof JWTInvalid && !forceRefresh) {
      return verifyJWTSignature({
        jwt,
        jwksProvider,
        saleorDomain,
        forceRefresh: true,
      });
    }

    throw err;
  }
};

/**
 *
 * @param payload - Raw request body.
 * @param jws - Saleor-Signature header.
 * @param saleorDomain - Saleor-Domain header.
 * @param jwksProvider
 * @param forceRefresh - If JWKS should be refreshed upon failure.
 */
export const verifyWebhookSignature = async ({
  payload,
  jws,
  saleorDomain,
  jwksProvider,
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
  jwksProvider: JWSProvider;
  jws: string;
  payload: Buffer | string | undefined;
  saleorDomain: string;
}): Promise<void> => {
  const saleorJwks = await jwksProvider.get({
    issuer: saleorDomain,
    forceRefresh,
  });
  const [protectedHeader, signature] = jws.split("..") ?? [];
  const jwks = createLocalJWKSet(saleorJwks);

  try {
    await flattenedVerify(
      {
        protected: protectedHeader,
        payload: payload ?? "",
        signature,
      },
      jwks,
    );
  } catch (err) {
    if (err instanceof JWTInvalid && !forceRefresh) {
      return verifyWebhookSignature({
        payload,
        jws,
        saleorDomain,
        jwksProvider,
        forceRefresh: true,
      });
    }

    throw err;
  }
};
