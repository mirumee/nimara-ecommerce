import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { getPaymentService } from "@/services/payment";
import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";
import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

  // get checkout session by id and channelSlug from request params
  const paymentService = await getPaymentService();
  // secretTToken from payment gateway
  const checkout_session = await acpService.getCheckoutSession({
    checkoutSessionId: id,
  });
  const checkout = checkout_session.data?.checkoutSession;

  if (!checkout) {
    storefrontLogger.error(
      "Failed to fetch checkout session for channel ${channelSlug} and id ${id}.",
    );

    return NextResponse.json(
      { status: "Error fetching checkout session" },
      { status: 500 },
    );
  }

  const transaction = await paymentService.paymentGatewayTransactionInitialize({
    id: checkout.id,
    amount: checkout.totalPrice.gross.amount,
    sharedPaymentToken: checkout.sharedPaymentToken, // TODO
  });

  if (!transaction) {
    storefrontLogger.error(
      "Failed to initialize payment transaction for checkout session ${id}.",
    );
    return NextResponse.json(
      { status: "Error initializing payment transaction" },
      { status: 500 },
    );
  }

  const transactionId = transaction.data?.transactionId;
  const result = await paymentService.paymentResultProcess({
    checkout: {},
    searchParams: { transactionId: transactionId! },
  });
  // TODO tutaj zrobic chcekout comple

  // TODO: Add logic here to complete the checkout session with the given ID

  // Revalidate cache for this particular checkout session ID on update on success
  revalidateTag(`MCP_CHECKOUT_SESSION:${id}`);

  return NextResponse.json({ status: "Not implemented" }, { status: 501 });
}
