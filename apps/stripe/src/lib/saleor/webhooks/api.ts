import { type ResponseSchema } from "@/lib/api/schema";
import { responseError } from "@/lib/api/util";
import { getLoggingProvider } from "@/providers/logging";

import { type SaleorWebhookHeaders } from "../headers";
import { type WebhookData } from "./types";
import { verifySaleorWebhookSignature } from "./util";

export const verifySaleorWebhookRoute =
  <T extends { event: unknown }>(
    handler: (opts: {
      event: WebhookData<T>;
      headers: SaleorWebhookHeaders;
      request: Request;
    }) => Promise<Response>,
  ) =>
  async (request: Request): Promise<Response> => {
    const logger = getLoggingProvider();

    logger.info(`Received Saleor webhook at ${new URL(request.url).pathname}.`);

    const { headers, errors, context } = await verifySaleorWebhookSignature({
      headers: request.headers,
      payload: await request.clone().text(),
    });

    if (errors) {
      return responseError({
        description: "Saleor webhook verification failed",
        context,
        errors,
      } as ResponseSchema);
    }

    const event = (await request.clone().json()) as WebhookData<T>;

    return handler({ event, headers, request });
  };
