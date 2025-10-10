import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";
import { checkoutSessionCompleteSchema } from "@nimara/infrastructure/mcp/schema";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";
import { getPaymentService } from "@/services/payment";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
    paymentService: getPaymentService,
  });

  const body = (await request.json()) as Record<string, unknown>;

  const parsedBody = checkoutSessionCompleteSchema.safeParse(body);

  if (!parsedBody.success) {
    storefrontLogger.error("Invalid request body", {
      errors: parsedBody.error.issues,
    });

    return NextResponse.json(
      {
        status: "Invalid request body",
        errors: parsedBody.error.issues.map((i) => ({
          message: i.message,
          path: i.path.join("."),
        })),
      },
      { status: 400 },
    );
  }

  const result = await acpService.completeCheckoutSession({
    checkoutSessionId: id,
    checkoutSessionComplete: parsedBody.data,
  });

  if (!result.ok) {
    return NextResponse.json(
      { errors: result.errors },
      { status: 400, statusText: "Failed to complete checkout session" },
    );
  }

  // Revalidate the cart page to reflect the updated checkout session state
  revalidateTag(`cart-${channelSlug}`);

  return NextResponse.json({ checkoutSession: result.data.checkoutSession });
}
