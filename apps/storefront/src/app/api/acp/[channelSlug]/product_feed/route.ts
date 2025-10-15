import { NextResponse } from "next/server";

import { localePrefixes } from "@/i18n/routing";
import { idempotencyStorage } from "@/lib/acp";
import { validateChannelParam } from "@/lib/channel";
import { getACPService } from "@/services/acp";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";
  const noCacheRequest = request.headers.get("Cache-Control") === "no-cache";

  if (idempotencyKey && !noCacheRequest) {
    if (idempotencyKey) {
      const cached = idempotencyStorage.get(idempotencyKey);

      if (cached) {
        storefrontLogger.debug(
          "Idempotent request - returning cached response",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createResponse(cached);
      }
    }
  }

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

  const responseData = productFeedResult.data;
  const responseStatus = 201;
  const responseHeaders = {
    "Request-Id": requestId,
    "Idempotency-Key": idempotencyKey || "",
  };

  if (idempotencyKey) {
    storefrontLogger.debug("Storing response for idempotency", {
      idempotencyKey,
      requestId,
    });

    idempotencyStorage.set(
      idempotencyKey,
      responseData,
      responseStatus,
      responseHeaders,
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
