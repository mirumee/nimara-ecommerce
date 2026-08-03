import { isError } from "@/lib/error";
import { getJWKSProvider } from "@/providers/jwks";

import { verifyWebhookSignature } from "../auth/jwt";
import { assertDomainAllowed } from "../config/context";
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
    return { headers: null, errors: error.issues, context: "signature" };
  }

  const saleorDomain = data["saleor-domain"];

  try {
    assertDomainAllowed(saleorDomain);
  } catch (err) {
    return {
      headers: null,
      context: "domain",
      errors: [
        {
          message: isError(err) ? err.message : "Saleor domain is not allowed",
        },
      ],
    };
  }

  const jwksProvider = getJWKSProvider({ saleorDomain });

  try {
    await verifyWebhookSignature({
      jws: data["saleor-signature"],
      jwksProvider,
      payload,
      saleorDomain,
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
