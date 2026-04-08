import { type NextRequest, NextResponse } from "next/server";

import {
  convertToMessageErrors,
  deriveStatusFromErrors,
} from "@nimara/infrastructure/ucp/saleor/error-response-converter";

import { idempotencyStorage } from "@/features/acp/acp";
import { validateUCPVersion } from "@/features/ucp/version-negotiation";
import { getHttpStatusFromErrors } from "@/foundation/http/error-to-status";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const versionNegotiation = validateUCPVersion(request);

  if (!versionNegotiation.ok) {
    return versionNegotiation.errorResponse;
  }

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey);

    if (cached) {
      storefrontLogger.debug(
        "[UCP] Idempotent request - returning cached response",
        {
          idempotencyKey,
        },
      );

      return idempotencyStorage.createResponse(cached.cached);
    }
  }

  const ucpService = await getUCPService({
    channelSlug,
  });

  const result = await ucpService.getOrder({ id });

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const orderStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(
      `[UCP] Failed to fetch order for channel ${channelSlug} and id ${id}`,
      {
        errors: result.errors,
        messages,
        orderStatus,
        httpStatus,
      },
    );

    return NextResponse.json(
      {
        messages,
        status: orderStatus,
      },
      {
        status: httpStatus,
        headers: {
          "Request-Id": requestId,
        },
      },
    );
  }

  const responseData = result.data;
  const responseStatus = 200;
  const responseHeaders = {
    "Request-Id": requestId,
    "Idempotency-Key": idempotencyKey || "",
  };

  if (idempotencyKey) {
    storefrontLogger.debug("[UCP] Storing response for idempotency", {
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

export async function PUT() {
  // Return 422 Unprocessable Entity error
  // for malformed adjustments field on completed order.
  return NextResponse.json(
    {
      messages: [],
      status: "unprocessable_entity",
    },
    { status: 422 },
  );
}
