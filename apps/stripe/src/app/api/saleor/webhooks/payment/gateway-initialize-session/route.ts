import { type PaymentGatewayInitializeSessionSubscription } from "@/graphql/subscriptions/generated";
import { verifyWebhookSignature } from "@/lib/saleor/auth/jwt";
import { saleorWebhookHeaders } from "@/lib/saleor/headers";
import { getConfigProvider } from "@/providers/config";
import { getJWKSProvider } from "@/providers/jwks";

const verifySaleorWebhookSignature = async ({
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

export async function POST(request: Request) {
  const { headers, error } = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: await request.clone().text(),
  });

  if (error) {
    return Response.json(error, { status: 400 });
  }

  const json = (await request.json()) as NonNullable<
    PaymentGatewayInitializeSessionSubscription["event"]
  >;
  const configProvider = getConfigProvider({
    saleorDomain: headers["saleor-domain"],
  });
  const gatewayConfig = await configProvider.getPaymentGatewayConfigForChannel({
    saleorDomain: headers["saleor-domain"],
    channelSlug: json.sourceObject.channel.slug,
  });

  return Response.json({ data: { publishableKey: gatewayConfig?.publicKey } });
}
