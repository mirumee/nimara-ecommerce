import { get } from "lodash";

import { type TransactionProcessSessionSubscription } from "@/graphql/subscriptions/generated";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/currency";
import { type WebhookData } from "@/lib/saleor/webhooks/types";
import { verifySaleorWebhookSignature } from "@/lib/saleor/webhooks/util";
import { getStripeApi } from "@/lib/stripe/api";
import {
  getGatewayMetadata,
  getIntentDashboardUrl,
  mapStatusToActionType,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";

export async function POST(request: Request) {
  const { headers, error } = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: await request.clone().text(),
  });

  if (error) {
    return Response.json(error, { status: 400 });
  }

  const json =
    (await request.json()) as WebhookData<TransactionProcessSessionSubscription>;
  const saleorDomain = headers["saleor-domain"];

  const configProvider = getConfigProvider({ saleorDomain });
  let gatewayConfig;

  try {
    gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
      saleorDomain: headers["saleor-domain"],
      channelSlug: json.sourceObject.channel.slug,
    });
  } catch {
    return Response.json({ errors: [""] }, { status: 42 });
  }

  const stripe = getStripeApi(gatewayConfig.secretKey);

  let intent;
  const extraMetadata = (json.data as { metadata?: Record<string, string> })
    ?.metadata;

  if (json.data) {
    intent = await stripe.paymentIntents.update(json.transaction.pspReference, {
      ...(json.data as {}),
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
  } else {
    intent = await stripe.paymentIntents.retrieve(
      json.transaction.pspReference,
    );
  }

  const result = mapStatusToActionType({
    actionType: json.action.actionType,
    status: intent.status,
  });

  return Response.json({
    pspReference: intent.id,
    result: result,
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
}
