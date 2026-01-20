import { createRemoteJWKSet, flattenedVerify } from "jose";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

const JWKS = createRemoteJWKSet(
  new URL(
    new URL(clientEnvs.NEXT_PUBLIC_SALEOR_API_URL).origin +
      "/.well-known/jwks.json",
  ),
);

// https://docs.saleor.io/docs/3.x/developer/extending/webhooks/payload-signature#validating-signature
export const verifySaleorWebhookSignature = async (request: Request) => {
  const jws = request.headers.get("saleor-signature");
  const buffer = await request.clone().text();
  const [header, _, signature] = jws?.split(".") ?? [];

  try {
    await flattenedVerify(
      {
        protected: header,
        // @ts-expect-error https://nodejs.org/api/buffer.html#buftostringencoding-start-end
        payload: buffer.toString("utf-8"),
        signature,
      },
      JWKS,
    );
  } catch (e) {
    storefrontLogger.error("Saleor webhook signature verification failed.");

    throw new Error("Saleor webhook signature verification failed, skipping.");
  }
};
