import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { type ResponseSchema } from "@/lib/api/schema";
import { responseError } from "@/lib/api/util";
import { getJWKSProvider } from "@/providers/jwks";
import { getLoggingProvider } from "@/providers/logging";

import { verifyWebhookSignature } from "../auth/jwt";
import { type SaleorWebhookHeaders, saleorWebhookHeaders } from "../headers";
import { type WebhookData } from "./types";

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

export const verifySaleorWebhookRoute =
  <T extends { event: unknown }>(
    handler: (opts: {
      event: WebhookData<T>;
      headers: SaleorWebhookHeaders;
      request: Request;
    }) => Promise<Response>,
  ) =>
  async (request: Request) => {
    const logger = getLoggingProvider();

    logger.info(`Received Saleor webhook at ${new URL(request.url).pathname}.`);

    const { headers, error } = await verifySaleorWebhookSignature({
      headers: request.headers,
      payload: await request.clone().text(),
    });

    if (error) {
      return responseError({
        description: "Saleor webhook verification failed",
        ...error,
      } as ResponseSchema);
    }

    const event =
      (await request.json()) as WebhookData<PaymentGatewayInitializeSessionSubscription>;

    return handler({ event, headers, request });
  };
