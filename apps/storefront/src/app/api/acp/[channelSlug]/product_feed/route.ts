import { NextResponse } from "next/server";

import { saleorAPCService } from "@nimara/infrastructure/mcp/saleor/service";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const { channelSlug } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    storefrontLogger.error(`Invalid channel slug: ${channelSlug}`);

    return NextResponse.json(
      { status: "Invalid channel slug" },
      { status: 400 },
    );
  }
  const acpService = saleorAPCService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

  const productFeedResult = await acpService.getProductFeed({
    channelPrefix: marketData.id,
    channel: channelSlug,
    limit: 100,
  });

  if (!productFeedResult.ok) {
    storefrontLogger.error(
      "Failed to fetch product feed for channel ${channelSlug}",
    );

    return NextResponse.json(
      { status: "Failed to fetch product feed" },
      { status: 500 },
    );
  }

  if (productFeedResult.data.products.length > 0) {
    return NextResponse.json({ products: productFeedResult.data.products });
  }
}
