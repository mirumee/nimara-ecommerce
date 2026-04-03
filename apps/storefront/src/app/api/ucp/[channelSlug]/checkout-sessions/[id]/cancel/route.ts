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

async function parseJsonBody(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  const raw = await request.text();

  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

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

  const body = await parseJsonBody(request);

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey, body);

    if (cached) {
      if (cached.conflict) {
        storefrontLogger.debug(
          "[UCP] Idempotency conflict - same key with different request body",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createConflictResponse();
      }

      storefrontLogger.debug(
        "[UCP] Idempotent request - returning cached response",
        {
          idempotencyKey,
        },
      );

      return idempotencyStorage.createResponse(cached.cached);
    }
  }

  const ucpService = await getUCPService({ channelSlug });
  const result = await ucpService.cancelCheckout({ id });

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(
      `[UCP] Failed to cancel checkout session for id ${id}`,
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
    storefrontLogger.debug("[UCP] Storing cancel response for idempotency", {
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
