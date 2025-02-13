import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { type WebhookData } from "@/lib/saleor/webhooks/types";
import { verifySaleorWebhookSignature } from "@/lib/saleor/webhooks/util";
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
    (await request.json()) as WebhookData<PaymentGatewayInitializeSessionSubscription>;
  const configProvider = getConfigProvider({
    saleorDomain: headers["saleor-domain"],
  });
  const gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
    saleorDomain: headers["saleor-domain"],
    channelSlug: json.sourceObject.channel.slug,
  });

  return Response.json({ data: { publishableKey: gatewayConfig?.publicKey } });
}
