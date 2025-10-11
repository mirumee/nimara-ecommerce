import { type NextRequest, NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";
import { checkoutSessionCreateSchema } from "@nimara/infrastructure/mcp/schema";
import { type ACPError } from "@nimara/infrastructure/mcp/types";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const { channelSlug } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          "Invalid channel slug provided. This channel is not supported.",
        param: "channelSlug",
      },
      { status: 400 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  const parsedBody = checkoutSessionCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    storefrontLogger.error("Invalid request body", {
      errors: parsedBody.error.issues,
    });

    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Invalid request body.",
        param: "body",
      },
      { status: 400 },
    );
  }

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

  const result = await acpService.createCheckoutSession({
    input: parsedBody.data,
  });

  if (!result.ok) {
    storefrontLogger.error("Error creating checkout session", {
      errors: result.error,
    });

    return NextResponse.json<ACPError>(result.error, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 201 });
}
