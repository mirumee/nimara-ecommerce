import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getAmountFromCents } from "@/lib/currency";
import { isError, isErrorOfType } from "@/lib/error";
import { getStripeApi } from "@/lib/stripe/api";
import {
  StripeMetaKey,
  type SupportedStripeWebhookEvent,
} from "@/lib/stripe/const";
import {
  getIntentDashboardUrl,
  mapStripeEventToSaleorEvent,
} from "@/lib/stripe/util";
import { getConfigProvider } from "@/providers/config";
import { getLoggingProvider } from "@/providers/logging";
import { getSaleorClient } from "@/providers/saleor";

export async function POST(request: NextRequest) {
  const body = await request.clone().text();
  const json = (await request.json()) as SupportedStripeWebhookEvent;

  const stripeObject = json.data.object;
  const saleorDomain = stripeObject.metadata?.[StripeMetaKey.SALEOR_DOMAIN];
  const channelSlug = stripeObject.metadata?.[StripeMetaKey.CHANNEL_SLUG];
  const transactionId = stripeObject.metadata?.[StripeMetaKey.TRANSACTION_ID];

  if (!transactionId || !saleorDomain || !channelSlug) {
    throw new Error(`Missing required metadata in Stripe event.`, {
      cause: { eventId: json.type, objectId: stripeObject.id },
    });
  }

  const logger = getLoggingProvider();
  const saleorClient = getSaleorClient({ saleorDomain, logger });
  const configProvider = getConfigProvider({ saleorDomain });
  const gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
    saleorDomain,
    channelSlug,
  });
  const api = getStripeApi(gatewayConfig.secretKey);

  console.log(
    { gatewayConfig, signature: request.headers.get("stripe-signature") },
    null,
    2,
  );

  try {
    api.webhooks.constructEvent(
      // @ts-expect-error https://nodejs.org/api/buffer.html#buftostringencoding-start-end
      body.toString("utf-8"),
      request.headers.get("stripe-signature") ?? "",
      gatewayConfig.webhookSecretKey ?? "",
    );
  } catch (err) {
    const message = isError(err) ? err.message : "Webhook verification failed.";

    return NextResponse.json({ errors: [{ message }] }, { status: 500 });
  }

  const eventData = mapStripeEventToSaleorEvent(json);

  await saleorClient.transactionReport({
    transactionId,
    amount: getAmountFromCents({
      currency: stripeObject.currency,
      amount: stripeObject.amount,
    }),
    // @ts-expect-error Charge won't have last_payment_error.
    message: stripeObject?.last_payment_error?.code ?? null,
    externalUrl: getIntentDashboardUrl({
      paymentId: json.data.object.id,
      secretKey: gatewayConfig.secretKey,
    }),
    pspReference: json.data.object.id,
    time: new Date().toUTCString(),
    ...eventData,
  });

  return Response.json({ status: "ok" });
}

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
