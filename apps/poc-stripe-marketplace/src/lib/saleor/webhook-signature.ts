import { createRemoteJWKSet, flattenedVerify } from "jose";

import { CONFIG } from "@/config";
import { saleorWebhookHeaders, type SaleorWebhookHeaders } from "@/lib/saleor/headers";

type VerifySaleorWebhookSignatureResult =
  | { headers: SaleorWebhookHeaders; success: true }
  | {
      details?: unknown;
      error: string;
      success: false;
    };

const parseDetachedSignature = (signature: string) => {
  const separatorIndex = signature.indexOf("..");

  if (separatorIndex <= 0 || separatorIndex >= signature.length - 2) {
    return null;
  }

  return {
    protectedHeader: signature.slice(0, separatorIndex),
    signatureValue: signature.slice(separatorIndex + 2),
  };
};

export const verifySaleorWebhookSignature = async ({
  headers,
  payload,
}: {
  headers: Headers;
  payload: string;
}): Promise<VerifySaleorWebhookSignatureResult> => {
  const headersParsed = saleorWebhookHeaders.safeParse(
    Object.fromEntries(headers.entries()),
  );

  if (!headersParsed.success) {
    return {
      success: false,
      error: "Invalid Saleor webhook headers.",
      details: headersParsed.error.flatten(),
    };
  }

  const saleorDomain = headersParsed.data["saleor-domain"];
  const saleorApiUrl = new URL(headersParsed.data["saleor-api-url"]);

  if (saleorDomain !== CONFIG.SALEOR_DOMAIN || saleorApiUrl.host !== CONFIG.SALEOR_DOMAIN) {
    return {
      success: false,
      error: "Saleor domain is not allowed.",
    };
  }

  const signatureParsed = parseDetachedSignature(headersParsed.data["saleor-signature"]);

  if (!signatureParsed) {
    return {
      success: false,
      error: "Invalid Saleor signature format.",
    };
  }

  try {
    const jwks = createRemoteJWKSet(
      new URL(`https://${saleorApiUrl.host}/.well-known/jwks.json`),
    );

    await flattenedVerify(
      {
        protected: signatureParsed.protectedHeader,
        payload,
        signature: signatureParsed.signatureValue,
      },
      jwks,
    );

    return {
      success: true,
      headers: headersParsed.data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Invalid Saleor webhook signature.",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
  }
};
