import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { ResponseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { type WebhookData } from "@/lib/saleor/webhooks/types";
import { verifySaleorWebhookSignature } from "@/lib/saleor/webhooks/util";
import { getStripeApi } from "@/lib/stripe/api";
import { getConfigProvider } from "@/providers/config";

export async function POST(request: Request) {
  const { headers, error } = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: await request.clone().text(),
  });

  if (error) {
    return Response.json(error, { status: 400 });
  }

  const event =
    (await request.json()) as WebhookData<PaymentGatewayInitializeSessionSubscription>;
  const saleorDomain = headers["saleor-domain"];
  const configProvider = getConfigProvider({ saleorDomain });
  let gatewayConfig;

  try {
    gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
      saleorDomain,
      channelSlug: event.sourceObject.channel.slug,
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

  // stripe.refunds.create({
  //   payment_intent: event.
  // })

  return Response.json({ data: { publishableKey: gatewayConfig?.publicKey } });
}
