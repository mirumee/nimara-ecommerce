import { type TransactionCancelationRequestedSubscription } from "@/graphql/subscriptions/generated";
import { type ResponseSchema } from "@/lib/api/schema";
import { ResponseError } from "@/lib/api/util";
import { getAmountFromCents } from "@/lib/currency";
import { isError } from "@/lib/error";
import {
  type TransactionEventSchema,
  transactionEventSchema,
} from "@/lib/saleor/transaction/schema";
import { type WebhookData } from "@/lib/saleor/webhooks/types";
import { verifySaleorWebhookSignature } from "@/lib/saleor/webhooks/util";
import { getStripeApi } from "@/lib/stripe/api";
import { getIntentDashboardUrl } from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export async function POST(request: Request) {
  const { headers, error } = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: await request.clone().text(),
  });
  const logger = getLoggingProvider();

  logger.info("Received TransactionCancelationRequested webhook.");

  if (error) {
    return ResponseError({
      description: "Saleor webhook verification failed",
      ...error,
    } as ResponseSchema);
  }

  const event =
    (await request.json()) as WebhookData<TransactionCancelationRequestedSubscription>;
  const saleorDomain = headers["saleor-domain"];
  const configProvider = getConfigProvider({ saleorDomain });
  let gatewayConfig;

  if (!event.transaction?.sourceObject) {
    logger.error(
      "Could not process transaction TransactionCancelationRequested.",
    );

    return ResponseError({
      description: "Missing source object information.",
      errors: [],
      status: 422,
    });
  }

  try {
    gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
      saleorDomain: headers["saleor-domain"],
      channelSlug: event.transaction.sourceObject.channel.slug,
    });
  } catch (err) {
    const errors = isError(err) ? [{ message: err.message }] : [];

    return ResponseError({
      description: "Missing gateway configuration for channel.",
      errors,
      status: 422,
    });
  }

  const stripe = getStripeApi(gatewayConfig.secretKey);

  // TODO: Handle Stripe errors everywhere
  const intent = await stripe.paymentIntents.retrieve(
    event.transaction.pspReference,
  );

  let eventData: Partial<TransactionEventSchema> = {
    pspReference: intent.id,
  };

  if (intent.status === "canceled") {
    eventData = {
      ...eventData,
      result: "CANCEL_SUCCESS",
      amount: getAmountFromCents({
        currency: intent.currency,
        amount: intent.amount,
      }),
      externalUrl: getIntentDashboardUrl({
        paymentId: intent.id,
        secretKey: gatewayConfig.secretKey,
      }),
    };
  }

  const eventResult = transactionEventSchema.safeParse(eventData);

  if (!eventResult.success) {
    const message =
      "Failed to construct TransactionCancelationRequested event response.";

    logger.error(message, { errors: eventResult.error.issues });

    return ResponseError({
      description: message,
      errors: eventResult.error.issues,
      status: 422,
    });
  }

  logger.debug("Constructed TransactionCancelationRequested event response.", {
    eventResult,
  });

  return Response.json(eventResult.data);
}
