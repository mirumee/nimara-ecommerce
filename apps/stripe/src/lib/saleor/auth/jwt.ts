import { createLocalJWKSet, decodeJwt, flattenedVerify, jwtVerify } from "jose";
import { JWTInvalid } from "jose/errors";

import { type JWSProvider } from "@/lib/jwks/types";

export const verifyJWTSignature = async ({
  jwt,
  jwksProvider,
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
  jwksProvider: JWSProvider;
  jwt: string;
}): Promise<void> => {
  const unverifiedPayload = decodeJwt(jwt);
  const saleorJwks = await jwksProvider.get({
    issuer: unverifiedPayload["iss"] ?? "",
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
 * @param issuer - Saleor-Api-Url header.
 * @param jwksProvider
 * @param forceRefresh - If JWKS should be refreshed upon failure.
 */
export const verifyWebhookSignature = async ({
  payload,
  jws,
  issuer,
  jwksProvider,
  forceRefresh = false,
}: {
  forceRefresh?: boolean;
  issuer: string;
  jwksProvider: JWSProvider;
  jws: string;
  payload: Buffer | string | undefined;
}): Promise<void> => {
  const saleorJwks = await jwksProvider.get({ issuer, forceRefresh });
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
        issuer,
        jwksProvider,
        forceRefresh: true,
      });
    }

    throw err;
  }
};
