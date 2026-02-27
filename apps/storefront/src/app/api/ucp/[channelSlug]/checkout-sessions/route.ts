import { type CheckoutCreateRequest } from "@ucp-js/sdk";
import { type NextRequest, NextResponse } from "next/server";

import { idempotencyStorage } from "@/features/acp/acp";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const authHeader = request.headers.get("Authorization");
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";
  const signature = request.headers.get("Signature");
  const apiVersion = request.headers.get("Api-Version");

  storefrontLogger.debug("Received request to create checkout session", {
    authHeader,
    idempotencyKey,
    requestId,
    signature,
    apiVersion,
  });

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey);

    if (cached) {
      storefrontLogger.debug("Idempotent request - returning cached response", {
        idempotencyKey,
      });

      return idempotencyStorage.createResponse(cached);
    }
  }

  const body = (await request.json()) as CheckoutCreateRequest;
  const ucpService = await getUCPService({ channelSlug });
  const result = await ucpService.createCheckoutSession(body);

  if (!result.ok) {
    storefrontLogger.error("Invalid request body", {
      errors: result.errors,
    });

    return NextResponse.json(result.errors, {
      status: 500,
      headers: {
        "Request-Id": requestId,
      },
    });
  }

  const responseData = result.data;
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
