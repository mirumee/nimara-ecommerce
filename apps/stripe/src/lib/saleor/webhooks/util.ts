import { verifyWebhookSignature } from "@/lib/saleor/auth/jwt";
import { saleorWebhookHeaders } from "@/lib/saleor/headers";
import { getJWKSProvider } from "@/providers/jwks";

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
    return {
      headers: null,
      error: { context: "headers", errors: error.errors },
    };
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
    let message = "Signature verification failed";

    if (err instanceof Error) {
      message = err.message;
    }

    return {
      headers: null,
      error: { context: "signature", errors: { message } },
    };
  }

  return { headers: data, error: null };
};
