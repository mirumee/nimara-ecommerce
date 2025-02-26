import { isError } from "@/lib/error";
import { getJWKSProvider } from "@/providers/jwks";

import { verifyWebhookSignature } from "../auth/jwt";
import { saleorWebhookHeaders } from "../headers";

export const verifySaleorWebhookSignature = async ({
  payload,
  headers,
}: {
  headers: Request["headers"];
  payload: string;
}) => {
  const { data, success, error } = saleorWebhookHeaders.safeParse(
    Object.fromEntries(headers.entries()),
  );

  if (!success) {
    return { headers: null, errors: error.errors, context: "signature" };
  }

  const jwksProvider = getJWKSProvider();

  try {
    await verifyWebhookSignature({
      jws: data["saleor-signature"],
      jwksProvider,
      payload,
      issuer: data["saleor-api-url"],
    });
  } catch (err) {
    return {
      headers: null,
      context: "signature",
      errors: [
        {
          message: isError(err) ? err.message : "Signature verification failed",
        },
      ],
    };
  }

  return { headers: data, errors: null, context: null };
};
