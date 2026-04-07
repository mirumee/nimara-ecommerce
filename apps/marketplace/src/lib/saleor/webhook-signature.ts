import { createRemoteJWKSet, flattenedVerify } from "jose";
import { z } from "zod";

const saleorWebhookHeadersSchema = z.object({
  "saleor-api-url": z.string().url(),
  "saleor-domain": z.string().min(1),
  "saleor-event": z.string().min(1),
  "saleor-signature": z.string().min(1),
});

type VerifySaleorWebhookSignatureResult =
  | {
      success: true;
    }
  | {
      details?: unknown;
      error: string;
      success: false;
    };

const jwksResolverCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

const detachedJwsSchema = z
  .string()
  .regex(
    /^[A-Za-z0-9_-]+\.\.[A-Za-z0-9_-]+$/,
    "Invalid detached JWS format. Expected '<protected>..<signature>'.",
  );

const getJwksUrl = (saleorApiUrl: string) => {
  const origin = new URL(saleorApiUrl).origin;

  return new URL("/.well-known/jwks.json", origin);
};

const getJwksResolver = (jwksUrl: URL) => {
  const key = jwksUrl.href;
  const cached = jwksResolverCache.get(key);

  if (cached) {
    return cached;
  }

  const resolver = createRemoteJWKSet(jwksUrl);

  jwksResolverCache.set(key, resolver);

  return resolver;
};

const parseDetachedJws = (value: string) => {
  const parsed = detachedJwsSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  const [protectedHeader, signature] = parsed.data.split("..");

  if (!protectedHeader || !signature) {
    return null;
  }

  return { protectedHeader, signature };
};

export const verifySaleorWebhookSignature = async ({
  headers,
  payload,
}: {
  headers: Request["headers"];
  payload: string;
}): Promise<VerifySaleorWebhookSignatureResult> => {
  const parsedHeaders = saleorWebhookHeadersSchema.safeParse({
    "saleor-api-url": headers.get("saleor-api-url"),
    "saleor-domain": headers.get("saleor-domain"),
    "saleor-event": headers.get("saleor-event"),
    "saleor-signature": headers.get("saleor-signature"),
  });

  if (!parsedHeaders.success) {
    return {
      success: false,
      error: "Invalid Saleor webhook headers.",
      details: parsedHeaders.error.flatten(),
    };
  }

  const detachedJws = parseDetachedJws(parsedHeaders.data["saleor-signature"]);

  if (!detachedJws) {
    return {
      success: false,
      error: "Invalid Saleor webhook signature format.",
      details: {
        expectedFormat: "<protected>..<signature>",
      },
    };
  }

  const jwksUrl = getJwksUrl(parsedHeaders.data["saleor-api-url"]);

  try {
    await flattenedVerify(
      {
        protected: detachedJws.protectedHeader,
        payload,
        signature: detachedJws.signature,
      },
      getJwksResolver(jwksUrl),
    );
  } catch (error) {
    return {
      success: false,
      error: "Invalid Saleor webhook signature.",
      details: {
        jwksUrl: jwksUrl.href,
        message:
          error instanceof Error ? error.message : "Signature verification failed.",
      },
    };
  }

  return { success: true };
};
