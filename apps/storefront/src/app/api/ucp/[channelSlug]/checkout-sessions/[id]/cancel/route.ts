import { type NextRequest, NextResponse } from "next/server";

import { idempotencyStorage } from "@/features/acp/acp";
import { revalidateTag } from "@/foundation/cache/cache";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  // Cancel checkout has no request body per UCP spec - only id in path
  // For idempotency, we use id as the body identifier
  const idempotencyBody = { id };

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey, idempotencyBody);

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
  const result = await ucpService.cancelCheckout({ id });

  if (!result.ok) {
    storefrontLogger.error("Failed to cancel checkout session", {
      id,
      errors: result.errors,
    });

    // Return UCP Error Response format
    return NextResponse.json(
      {
        ucp: {
          version: "2026-01-11",
          status: "error",
        },
        messages: result.errors.map((error) => ({
          type: "error",
          code: error.code,
          content: error.message,
          severity: "unrecoverable",
        })),
      },
      {
        status: 400,
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
      idempotencyBody,
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
