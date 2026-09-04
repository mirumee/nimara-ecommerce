import { createLocalJWKSet, flattenedVerify, jwtVerify } from "jose";
import { JWKSNoMatchingKey, JWTInvalid } from "jose/errors";

import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { type JoseAuthService } from "#root/jose/auth/types";
import { type JwksRepository } from "#root/jose/jwks/types";

// An unknown `kid` or malformed token can mean the keys rotated — refetch once.
const isPossibleRotation = (error: unknown) =>
  error instanceof JWKSNoMatchingKey || error instanceof JWTInvalid;

const verificationError = (error: unknown) =>
  err([
    {
      code: "JWT_VERIFICATION_ERROR" as const,
      message: "Failed to verify the signature.",
      originalError: error,
    },
  ]);

export const joseAuthService = ({
  jwksRepository,
}: {
  jwksRepository: JwksRepository;
}): JoseAuthService => {
  const verifyWithRetry = async <Verified>({
    verify,
    forceRefresh = false,
  }: {
    forceRefresh?: boolean;
    verify: (jwks: ReturnType<typeof createLocalJWKSet>) => Promise<Verified>;
  }): AsyncResult<Verified> => {
    const keysResult = await jwksRepository.get({ forceRefresh });

    if (!keysResult.ok) {
      return keysResult;
    }

    try {
      // `JwkSet` is our jose-agnostic port type; hand it to jose here.
      return ok(
        await verify(
          createLocalJWKSet(
            keysResult.data as Parameters<typeof createLocalJWKSet>[0],
          ),
        ),
      );
    } catch (error) {
      if (!forceRefresh && isPossibleRotation(error)) {
        return verifyWithRetry({ verify, forceRefresh: true });
      }

      return verificationError(error);
    }
  };

  return {
    verifyJwt: (jwt) =>
      verifyWithRetry({
        verify: async (jwks) => (await jwtVerify(jwt, jwks)).payload,
      }),

    verifyDetachedJws: ({ jws, payload }) => {
      const [protectedHeader, signature] = jws.split("..") ?? [];

      return verifyWithRetry({
        verify: async (jwks) => {
          await flattenedVerify(
            { protected: protectedHeader, payload: payload ?? "", signature },
            jwks,
          );

          return true as const;
        },
      });
    },
  };
};
