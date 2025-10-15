import { NextResponse } from "next/server";

import { localePrefixes } from "@/i18n/routing";
import { validateChannelParam } from "@/lib/channel";
import { getACPService } from "@/services/acp";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const { channelSlug } = await params;

  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const acpService = await getACPService({ channelSlug });

  const marketLanguage = channelValidationResult.market.defaultLanguage.locale;
  const marketPrefix =
    marketLanguage === "en-US" ? "" : localePrefixes[marketLanguage];

  const productFeedResult = await acpService.getProductFeed({
    channelPrefix: marketPrefix,
    channel: channelSlug,
    limit: 100,
  });

  if (!productFeedResult.ok) {
    storefrontLogger.error(
      `Failed to fetch product feed for channel ${channelSlug}`,
    );

    return NextResponse.json(
      { status: "Failed to fetch product feed" },
      { status: 500 },
    );
  }

  return NextResponse.json(productFeedResult.data.products, {
    status: 200,
  });
}
