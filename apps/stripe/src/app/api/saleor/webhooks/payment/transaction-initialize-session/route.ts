import { type TransactionInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { ResponseError } from "@/lib/api/util";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";
import { isError } from "@/lib/error";
import { transactionEventSchema } from "@/lib/saleor/transaction/schema";
import { type WebhookData } from "@/lib/saleor/webhooks/types";
import { verifySaleorWebhookSignature } from "@/lib/saleor/webhooks/util";
import { getStripeApi } from "@/lib/stripe/api";
import {
  getGatewayMetadata,
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";

export async function POST(request: Request) {
  const { headers, error } = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: await request.clone().text(),
  });
  const logger = getLoggingProvider();

  if (error) {
    return Response.json(error, { status: 400 });
  }

  const json =
    (await request.json()) as WebhookData<TransactionInitializeSessionSubscription>;
  const saleorDomain = headers["saleor-domain"];
  const configProvider = getConfigProvider({ saleorDomain });
  let gatewayConfig;

  try {
    gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
      saleorDomain,
      channelSlug: json.sourceObject.channel.slug,
    });
  } catch (err) {
    const errors = isError(err) ? [{ message: err.message }] : [];

    console.log("-----------------------------------------------------");
    console.log(err);
    console.log("-----------------------------------------------------");

    return ResponseError({
      description: "Missing gateway configuration for channel.",
      errors,
      status: 422,
    });
  }

  const stripe = getStripeApi(gatewayConfig.secretKey);
  const extraMetadata = (json.data as { metadata?: Record<string, string> })
    ?.metadata;

  const intent = await stripe.paymentIntents.create({
    amount: getCentsFromAmount(json.sourceObject.total.gross),
    currency: json.sourceObject.total.gross.currency,
    capture_method:
      json.action.actionType === "CHARGE" ? "automatic" : "manual",
    metadata: getGatewayMetadata({
      saleorDomain,
      transactionId: json.transaction.id,
      channelSlug: json.sourceObject.channel.slug,
      ...extraMetadata,
    }),
  });

  const result = mapStatusToActionType({
    actionType: json.action.actionType,
    status: intent.status,
  });
  const eventResult = transactionEventSchema.safeParse({
    pspReference: intent.id,
    result,
    amount: getAmountFromCents({
      currency: intent.currency,
      amount: intent.amount,
    }),
    message: intent.last_payment_error?.code ?? null,
    data: {
      paymentIntent: {
        clientSecret: intent.client_secret,
        publishableKey: gatewayConfig.publicKey,
        time: intent.created,
        externalUrl: getIntentDashboardUrl({
          paymentId: intent.id,
          secretKey: gatewayConfig.secretKey,
        }),
      },
    },
  });

  if (!eventResult.success) {
    const message =
      "Failed to construct TransactionInitializeSession event response.";

    logger.error(message, { errors: eventResult.error.issues });

    console.log("-----------------------------------------------------");
    console.log(eventResult);
    console.log("-----------------------------------------------------");

    return ResponseError({
      description: message,
      errors: eventResult.error.issues,
      status: 422,
    });
  }

  return Response.json(eventResult.data);
}
