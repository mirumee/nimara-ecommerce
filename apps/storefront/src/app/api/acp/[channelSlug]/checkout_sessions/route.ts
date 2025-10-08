import { type NextRequest, NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";
import { checkoutSessionCreateSchema } from "@nimara/infrastructure/mcp/schema";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  _request: NextRequest,
  _props: { params: Promise<{ channelSlug: string }> },
) {
  return NextResponse.json({ status: "Not implemented" }, { status: 501 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const { channelSlug } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json(
      { status: "Invalid channel slug" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  const parsedBody = checkoutSessionCreateSchema.safeParse(body);

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
      errors: result.errors,
    });

    return NextResponse.json(
      { status: "Error creating checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data.checkoutSession, { status: 201 });
}
