import { type CompleteCheckoutRequestWithAp2 } from "@ucp-js/sdk";
import { type NextRequest, NextResponse } from "next/server";

import {
  convertToMessageErrors,
  deriveStatusFromErrors,
} from "@nimara/infrastructure/ucp/saleor/error-response-converter";

import { idempotencyStorage } from "@/features/acp/acp";
import { validateUCPVersion } from "@/features/ucp/version-negotiation";
import { revalidateTag } from "@/foundation/cache/cache";
import { getHttpStatusFromErrors } from "@/foundation/http/error-to-status";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

export async function POST(
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

  // Parse body early for idempotency check
  const body = (await request.json()) as CompleteCheckoutRequestWithAp2;

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey, body);

    if (cached) {
      if (cached.conflict) {
        storefrontLogger.debug(
          "Idempotency conflict - same key with different request body",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createConflictResponse();
      }

      storefrontLogger.debug("Idempotent request - returning cached response", {
        idempotencyKey,
      });

      return idempotencyStorage.createResponse(cached?.cached);
    }
  }

  const ucpService = await getUCPService({ channelSlug });
  const result = await ucpService.completeCheckoutSession({
    ...body,
    id,
  } as CompleteCheckoutRequestWithAp2);

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(
      `[UCP] Failed to complete checkout session for id ${id}`,
      {
        errors: result.errors,
        messages,
        checkoutStatus,
        httpStatus,
      },
    );

    return NextResponse.json(
      {
        messages,
        status: checkoutStatus,
      },
      {
        status: httpStatus,
        headers: {
          "Request-Id": requestId,
        },
      },
    );
  }

  revalidateTag(`UCP:CHECKOUT_SESSION:${id}`);

  const responseData = result.data;
  const responseStatus = 200;
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
      body,
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
