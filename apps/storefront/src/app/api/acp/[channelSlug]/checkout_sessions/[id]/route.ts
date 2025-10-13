import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json(
      { status: "Invalid channel slug" },
      { status: 400 },
    );
  }

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

  // TODO: Validate if ID is checkout type or order type after checkout is completed.
  const result = await acpService.getCheckoutSession({
    checkoutSessionId: id,
  });

  if (!result.ok) {
    storefrontLogger.error(
      `Failed to fetch checkout session for channel ${channelSlug} and id ${id}`,
    );

    return NextResponse.json(
      { status: "Error fetching checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.json(result.data.checkoutSession);
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json(
      { status: "Invalid channel slug" },
      { status: 400 },
    );
  }

  // TODO: Add logic here to update the checkout session with the given ID

  // Revalidate cache for this particular checkout session ID on update on success
  revalidateTag(`MCP_CHECKOUT_SESSION:${id}`);

  return NextResponse.json({ status: "Not implemented" }, { status: 501 });
}
